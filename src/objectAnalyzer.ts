import { cloneDeep, difference, intersection } from 'lodash';

import { ErrorMessages, InfoMessages, VARIABLE_REGEX } from './constants';
import { BaseType, FunctionType, ObjectType } from './types';
import * as utils from './utils';

export class ObjectAnalyzer {
  static analyze(typeObj: BaseType, lang: string, jsonObj: unknown, defaultJsonObj: unknown): void {
    if (jsonObj == defaultJsonObj) return;

    this.analyzeRecursively(typeObj, lang, jsonObj, '', defaultJsonObj);
  }

  private static analyzeRecursively(
    typeObj: BaseType,
    lang: string,
    jsonObj: unknown,
    varName: string,
    defaultJsonObj: unknown
  ): void {
    if (typeObj instanceof FunctionType) {
      if (!utils.isString(defaultJsonObj)) throw new Error(ErrorMessages.unreachable());
      if (!utils.isString(jsonObj)) throw new Error(ErrorMessages.varShouldString(lang, varName));

      let match: RegExpExecArray | null = null;
      while ((match = VARIABLE_REGEX.exec(jsonObj))) {
        const param = match[1];
        if (!typeObj.params.includes(param)) {
          typeObj.params.push(param);
          console.info(InfoMessages.functionParamAdded(lang, varName, param));
        }
      }
    } else if (typeObj instanceof ObjectType) {
      if (!utils.isObject(defaultJsonObj)) throw new Error(ErrorMessages.unreachable());
      if (!utils.isObject(jsonObj)) throw new Error(ErrorMessages.varShouldObject(lang, varName));

      const [keys, defaultKeys] = [Object.keys(jsonObj), Object.keys(defaultJsonObj)];
      const excessKeys = difference(keys, defaultKeys);
      const lackedKeys = difference(defaultKeys, keys);
      const sharedKeys = intersection(keys, defaultKeys);
      for (const key of excessKeys) {
        delete jsonObj[key];
        const memberVarName = utils.memberVarName(varName, key);
        console.info(InfoMessages.varIgnored(lang, memberVarName));
      }
      for (const key of lackedKeys) {
        jsonObj[key] = cloneDeep(defaultJsonObj[key]);
        const memberVarName = utils.memberVarName(varName, key);
        console.info(InfoMessages.varFilled(lang, memberVarName));
      }
      for (const key of sharedKeys) {
        const memberVarName = utils.memberVarName(varName, key);
        const memberTypeObj = typeObj.map[key];
        if (!memberTypeObj) throw new Error(ErrorMessages.unreachable());
        this.analyzeRecursively(memberTypeObj, lang, jsonObj[key], memberVarName, defaultJsonObj[key]);
      }
    } else {
      throw new Error(ErrorMessages.unreachable());
    }
  }
}
