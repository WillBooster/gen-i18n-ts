import fs from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

import { ErrorMessages, VARIABLE_REGEX } from './constants.js';
import type { BaseType } from './types.js';
import { FunctionType, ObjectType } from './types.js';
import { getMemberVarName, isObject, isString } from './utils.js';

export function toLangObj(lang: string, langFilePath: string): unknown {
  const fileContent = fs.readFileSync(langFilePath, { encoding: 'utf8' });
  let langObj: unknown;
  switch (path.extname(langFilePath)) {
    case '.yaml':
    case '.yml': {
      langObj = yaml.load(fileContent);
      break;
    }
    default: {
      // .json
      langObj = JSON.parse(fileContent);
      break;
    }
  }
  validateLangObj(lang, langObj);
  return langObj;
}

export function toTypeObj(lang: string, langFilePath: string): BaseType {
  const fileContent = fs.readFileSync(langFilePath, { encoding: 'utf8' });
  let langObj: unknown;
  switch (path.extname(langFilePath)) {
    case '.yaml':
    case '.yml': {
      langObj = yaml.load(fileContent);
      break;
    }
    default: {
      // .json
      langObj = JSON.parse(fileContent);
      break;
    }
  }
  return langObjToTypeObj(lang, langObj);
}

function validateLangObj(lang: string, langObj: unknown): void {
  if (!isObject(langObj)) throw new Error(ErrorMessages.langFileNotObject(lang));
  validateLangObjRecursively(lang, langObj, '');
}

function validateLangObjRecursively(lang: string, langObj: unknown, varName: string): void {
  if (isString(langObj)) {
    return;
  } else if (isObject(langObj)) {
    for (const [key, value] of Object.entries(langObj)) {
      const memberVarName = getMemberVarName(varName, key);
      validateLangObjRecursively(lang, value, memberVarName);
    }
  } else {
    throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
  }
}

function langObjToTypeObj(lang: string, langObj: unknown): BaseType {
  if (!isObject(langObj)) throw new Error(ErrorMessages.langFileNotObject(lang));
  return langObjToTypeObjRecursively(lang, langObj, '');
}

function langObjToTypeObjRecursively(lang: string, langObj: unknown, varName: string): BaseType {
  if (isString(langObj)) {
    const params: string[] = [];
    let match: RegExpExecArray | null | undefined;
    while ((match = VARIABLE_REGEX.exec(langObj))) {
      const param = match[1];
      if (param && !params.includes(param)) params.push(param);
    }
    return new FunctionType(params);
  } else if (isObject(langObj)) {
    const map: Record<string, BaseType> = {};
    for (const [key, value] of Object.entries(langObj)) {
      const memberVarName = getMemberVarName(varName, key);
      map[key] = langObjToTypeObjRecursively(lang, value, memberVarName);
    }
    return new ObjectType(map);
  } else {
    throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
  }
}
