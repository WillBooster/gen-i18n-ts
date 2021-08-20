import fs from 'fs';
import path from 'path';

import { ErrorMessages, VARIABLE_REGEX } from './constants';
import { BaseType, FunctionType, ObjectType } from './types';
import * as utils from './utils';

import yaml from 'js-yaml';

export class LangFileConverter {
  static toLangObj(lang: string, langFilePath: string): unknown {
    const fileContent = fs.readFileSync(langFilePath, { encoding: 'utf-8' });
    let langObj = undefined;
    switch (path.extname(langFilePath)) {
      case '.yaml':
      case '.yml':
        langObj = yaml.load(fileContent);
        break;
      case '.json':
      default:
        langObj = JSON.parse(fileContent);
        break;
    }
    LangFileConverter.validateLangObj(lang, langObj);
    return langObj;
  }

  static toTypeObj(lang: string, langFilePath: string): BaseType {
    const fileContent = fs.readFileSync(langFilePath, { encoding: 'utf-8' });
    let langObj = undefined;
    switch (path.extname(langFilePath)) {
      case '.yaml':
      case '.yml':
        langObj = yaml.load(fileContent);
        break;
      case '.json':
      default:
        langObj = JSON.parse(fileContent);
        break;
    }
    return LangFileConverter.langObjToTypeObj(lang, langObj);
  }

  private static validateLangObj(lang: string, langObj: unknown): void {
    if (!utils.isObject(langObj)) throw new Error(ErrorMessages.langFileNotObject(lang));
    LangFileConverter.validateLangObjRecursively(lang, langObj, '');
  }

  private static validateLangObjRecursively(lang: string, langObj: unknown, varName: string): void {
    if (utils.isString(langObj)) {
      return;
    } else if (utils.isObject(langObj)) {
      for (const [key, value] of Object.entries(langObj)) {
        const variableNameRegex = /^[A-Za-z$_][A-Za-z0-9$_]*$/;
        if (!variableNameRegex.test(key)) {
          throw new Error(ErrorMessages.keyShouldBeLikeVariableName(lang, key, variableNameRegex));
        }
        const memberVarName = utils.memberVarName(varName, key);
        LangFileConverter.validateLangObjRecursively(lang, value, memberVarName);
      }
    } else {
      throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
    }
  }

  private static langObjToTypeObj(lang: string, langObj: unknown): BaseType {
    if (!utils.isObject(langObj)) throw new Error(ErrorMessages.langFileNotObject(lang));
    return LangFileConverter.langObjToTypeObjRecursively(lang, langObj, '');
  }

  private static langObjToTypeObjRecursively(lang: string, langObj: unknown, varName: string): BaseType {
    if (utils.isString(langObj)) {
      const params: string[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = VARIABLE_REGEX.exec(langObj))) {
        const param = match[1];
        if (!params.includes(param)) params.push(param);
      }
      return new FunctionType(params);
    } else if (utils.isObject(langObj)) {
      const map: Record<string, BaseType> = {};
      for (const [key, value] of Object.entries(langObj)) {
        const memberVarName = utils.memberVarName(varName, key);
        map[key] = LangFileConverter.langObjToTypeObjRecursively(lang, value, memberVarName);
      }
      return new ObjectType(map);
    } else {
      throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
    }
  }
}
