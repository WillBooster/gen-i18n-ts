import fs from 'fs';

import { ErrorMessages, VARIABLE_REGEX } from './constants';
import { BaseType, FunctionType, ObjectType } from './types';
import * as utils from './utils';

export class LangFileConverter {
  static toJsonObj(langFilePath: string): unknown {
    const lang = utils.filepathToLang(langFilePath);
    const jsonObj = JSON.parse(fs.readFileSync(langFilePath, { encoding: 'utf-8' }));
    LangFileConverter.validateJsonObj(lang, jsonObj);
    return jsonObj;
  }

  static toTypeObj(langFilePath: string): BaseType {
    const lang = utils.filepathToLang(langFilePath);
    const jsonObj = JSON.parse(fs.readFileSync(langFilePath, { encoding: 'utf-8' }));
    return LangFileConverter.jsonObjToTypeObj(lang, jsonObj);
  }

  private static validateJsonObj(lang: string, jsonObj: unknown): void {
    if (!utils.isObject(jsonObj)) throw new Error(ErrorMessages.langFileNotObject(lang));
    LangFileConverter.validateJsonObjRecursively(lang, jsonObj, '');
  }

  private static validateJsonObjRecursively(lang: string, jsonObj: unknown, varName: string): void {
    if (utils.isString(jsonObj)) {
      return;
    } else if (utils.isObject(jsonObj)) {
      for (const [key, value] of Object.entries(jsonObj)) {
        const variableNameRegex = /^[A-Za-z$_][A-Za-z0-9$_]*$/;
        if (!variableNameRegex.test(key)) {
          throw new Error(ErrorMessages.keyShouldBeLikeVariableName(lang, key, variableNameRegex));
        }
        const memberVarName = utils.memberVarName(varName, key);
        LangFileConverter.validateJsonObjRecursively(lang, value, memberVarName);
      }
    } else {
      throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
    }
  }

  private static jsonObjToTypeObj(lang: string, jsonObj: unknown): BaseType {
    if (!utils.isObject(jsonObj)) throw new Error(ErrorMessages.langFileNotObject(lang));
    return LangFileConverter.jsonObjToTypeObjRecursively(lang, jsonObj, '');
  }

  private static jsonObjToTypeObjRecursively(lang: string, jsonObj: unknown, varName: string): BaseType {
    if (utils.isString(jsonObj)) {
      const params: string[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = VARIABLE_REGEX.exec(jsonObj))) {
        const param = match[1];
        if (!params.includes(param)) params.push(param);
      }
      return new FunctionType(params);
    } else if (utils.isObject(jsonObj)) {
      const map: Record<string, BaseType> = {};
      for (const [key, value] of Object.entries(jsonObj)) {
        const memberVarName = utils.memberVarName(varName, key);
        map[key] = LangFileConverter.jsonObjToTypeObjRecursively(lang, value, memberVarName);
      }
      return new ObjectType(map);
    } else {
      throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
    }
  }
}
