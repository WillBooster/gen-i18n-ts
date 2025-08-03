import { ErrorMessages, InfoMessages, VARIABLE_REGEX } from './constants.js';
import type { BaseType } from './types.js';
import { FunctionType, ObjectType } from './types.js';
import { difference, getMemberVarName, intersection, isObject, isString } from './utils.js';

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
      if (!isString(defaultLangObj)) throw new Error(ErrorMessages.unreachable());
      if (!isString(langObj)) throw new Error(ErrorMessages.varShouldString(lang, varName));

      let match: RegExpExecArray | null | undefined;
      while ((match = VARIABLE_REGEX.exec(langObj))) {
        const param = match[1];
        if (param && !typeObj.params.includes(param)) {
          typeObj.params.push(param);
          console.info(InfoMessages.functionParamAdded(lang, varName, param));
        }
      }
    } else if (typeObj instanceof ObjectType) {
      if (!isObject(defaultLangObj)) throw new Error(ErrorMessages.unreachable());
      if (!isObject(langObj)) throw new Error(ErrorMessages.varShouldObject(lang, varName));

      const [keys, defaultKeys] = [new Set(Object.keys(langObj)), new Set(Object.keys(defaultLangObj))];
      const excessKeys = difference(keys, defaultKeys);
      const lackedKeys = difference(defaultKeys, keys);
      const sharedKeys = intersection(keys, defaultKeys);
      for (const key of excessKeys) {
        delete langObj[key];
        const memberVarName = getMemberVarName(varName, key);
        console.info(InfoMessages.varIgnored(lang, memberVarName));
      }
      for (const key of lackedKeys) {
        langObj[key] = defaultLangObj[key];
        const memberVarName = getMemberVarName(varName, key);
        console.info(InfoMessages.varFilled(lang, memberVarName));
      }
      for (const key of sharedKeys) {
        const memberVarName = getMemberVarName(varName, key);
        const memberTypeObj = typeObj.map[key];
        if (!memberTypeObj) throw new Error(ErrorMessages.unreachable());
        this.analyzeRecursively(memberTypeObj, lang, langObj[key], memberVarName, defaultLangObj[key]);
      }
    } else {
      throw new TypeError(ErrorMessages.unreachable());
    }
  }
}
