import { ErrorMessages } from './constants';
import { BaseType, FunctionType, ObjectType } from './types';
import * as utils from './utils';

export class CodeGenerator {
  static gen(typeObj: BaseType, jsonObjMap: { [lang: string]: unknown }, defaultLang: string): string {
    const langs = Object.keys(jsonObjMap);
    if (!langs.includes(defaultLang)) throw new Error(ErrorMessages.noDefaultLangFile());

    const varCurrentLang = 'currentLang';
    const varI18n = 'i18n';

    let code = '';

    for (const [lang, jsonObj] of Object.entries(jsonObjMap)) {
      const langCode = CodeGenerator.jsonObjToCode(lang, jsonObj);
      code += `const ${lang} = ${langCode};\n`;
    }

    code += `let ${varCurrentLang} = ${defaultLang};\n`;

    const i18nCode = CodeGenerator.typeObjToCode(typeObj, varCurrentLang);
    code += `export const ${varI18n} = ${i18nCode};\n`;

    const currentLangChangerCode = CodeGenerator.currentLangChangerCode(langs, varCurrentLang);
    code += `export ${currentLangChangerCode}\n`;

    return code;
  }

  private static jsonObjToCode(lang: string, jsonObj: unknown): string {
    if (!utils.isObject(jsonObj)) throw new Error(ErrorMessages.langFileNotObject(lang));

    return CodeGenerator.jsonObjToCodeRecursively(lang, jsonObj, '');
  }

  private static jsonObjToCodeRecursively(lang: string, jsonObj: unknown, varName: string): string {
    if (utils.isString(jsonObj)) {
      return `"${jsonObj}"`;
    } else if (utils.isObject(jsonObj)) {
      let members = '';
      for (const [key, value] of Object.entries(jsonObj)) {
        const memberVarName = utils.memberVarName(varName, key);
        const valueCode = CodeGenerator.jsonObjToCodeRecursively(lang, value, memberVarName);
        members += `${key}: ${valueCode}, `;
      }
      return `{ ${members} }`;
    }

    throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
  }

  private static typeObjToCode(typeObj: BaseType, varName: string): string {
    if (typeObj instanceof FunctionType) {
      const params = typeObj.params.map((param) => `${param}: string`).join(', ');
      const declaration = `function (${params}): string`;
      if (typeObj.params.length == 0) return `${declaration} { return ${varName} }`;

      const varParamMap = 'paramMap';
      const members = typeObj.params.map((param) => `"\${${param}}" : ${param},`).join(' ');
      const declarationStatement = `const ${varParamMap}: Record<string, string> = { ${members} };`;

      const varPattern = 'pattern';
      const patterns = typeObj.params.map((param) => `\\$\\{${param}\\}`).join('|');
      const regex = `/${patterns}/g`;
      const replaceFunc = `(${varPattern}) => ${varParamMap}[${varPattern}]`;
      const returnStatement = `return ${varName}.replace(${regex}, ${replaceFunc});`;

      return `${declaration} { ${declarationStatement} ${returnStatement} }`;
    } else if (typeObj instanceof ObjectType) {
      let members = '';
      for (const [key, value] of Object.entries(typeObj.map)) {
        const memberVarName = utils.memberVarName(varName, key);
        const valueCode = CodeGenerator.typeObjToCode(value, memberVarName);
        members += `${key}: ${valueCode}, `;
      }
      return `{ ${members} }`;
    } else {
      throw new Error(ErrorMessages.unreachable());
    }
  }

  private static currentLangChangerCode(langs: string[], varCurrentLang: string): string {
    const funcChangeCurrentLang = 'changeCurrentLang';
    const varLang = 'lang';
    const langType = langs.map((lang) => `"${lang}"`).join('|');
    const declaration = `function ${funcChangeCurrentLang}(${varLang}: ${langType}): void`;

    const cases = langs.map((lang) => `case "${lang}": ${varCurrentLang} = ${lang}; break;`).join(' ');
    const statement = `switch (${varLang}) { ${cases} }`;

    return `${declaration} { ${statement} }`;
  }
}
