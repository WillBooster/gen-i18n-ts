import { ErrorMessages, InfoMessages, VARIABLE_REGEX } from './constants';
import { BaseType, FunctionType, ObjectType } from './types';
import * as utils from './utils';

import { cloneDeep, difference, intersection } from 'lodash';

export class ObjectAnalyzer {
  static analyze(typeObj: BaseType, lang: string, langObj: unknown, defaultLangObj: unknown): void {
    if (langObj === defaultLangObj) return;

    this.analyzeRecursively(typeObj, lang, langObj, '', defaultLangObj);
  }

  private static analyzeRecursively(
    typeObj: BaseType,
    lang: string,
    langObj: unknown,
    varName: string,
    defaultLangObj: unknown
  ): void {
    if (typeObj instanceof FunctionType) {
      if (!utils.isString(defaultLangObj)) throw new Error(ErrorMessages.unreachable());
      if (!utils.isString(langObj)) throw new Error(ErrorMessages.varShouldString(lang, varName));

      let match: RegExpExecArray | null = null;
      while ((match = VARIABLE_REGEX.exec(langObj))) {
        const param = match[1];
        if (!typeObj.params.includes(param)) {
          typeObj.params.push(param);
          console.info(InfoMessages.functionParamAdded(lang, varName, param));
        }
      }
    } else if (typeObj instanceof ObjectType) {
      if (!utils.isObject(defaultLangObj)) throw new Error(ErrorMessages.unreachable());
      if (!utils.isObject(langObj)) throw new Error(ErrorMessages.varShouldObject(lang, varName));

      const [keys, defaultKeys] = [Object.keys(langObj), Object.keys(defaultLangObj)];
      const excessKeys = difference(keys, defaultKeys);
      const lackedKeys = difference(defaultKeys, keys);
      const sharedKeys = intersection(keys, defaultKeys);
      for (const key of excessKeys) {
        delete langObj[key];
        const memberVarName = utils.memberVarName(varName, key);
        console.info(InfoMessages.varIgnored(lang, memberVarName));
      }
      for (const key of lackedKeys) {
        langObj[key] = cloneDeep(defaultLangObj[key]);
        const memberVarName = utils.memberVarName(varName, key);
        console.info(InfoMessages.varFilled(lang, memberVarName));
      }
      for (const key of sharedKeys) {
        const memberVarName = utils.memberVarName(varName, key);
        const memberTypeObj = typeObj.map[key];
        if (!memberTypeObj) throw new Error(ErrorMessages.unreachable());
        this.analyzeRecursively(memberTypeObj, lang, langObj[key], memberVarName, defaultLangObj[key]);
      }
    } else {
      throw new Error(ErrorMessages.unreachable());
    }
  }
}
