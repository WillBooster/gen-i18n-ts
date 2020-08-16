import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { cloneDeep } from 'lodash';

import * as utils from './utils';
import { BaseType, FunctionType, ObjectType } from './types';
import { ErrorMessages, InfoMessages } from './constants';

const VARIABLE_REGEX = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

class LangFileConverter {
  static toJsonObj(langFilepath: string): unknown {
    const lang = utils.filepathToLang(langFilepath);
    const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
    LangFileConverter.validateJsonObj(lang, jsonObj);
    return jsonObj;
  }

  static toTypeObj(langFilepath: string): BaseType {
    const lang = utils.filepathToLang(langFilepath);
    const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
    const typeObj = LangFileConverter.jsonObjToTypeObj(lang, jsonObj);
    return typeObj;
  }

  private static validateJsonObj(lang: string, jsonObj: unknown): void {
    if (!utils.isObject(jsonObj)) {
      throw new Error(ErrorMessages.langFileNotObject(lang));
    }

    LangFileConverter.validateJsonObjRecursively(lang, jsonObj, '');
  }

  private static validateJsonObjRecursively(lang: string, jsonObj: unknown, varName: string): void {
    if (utils.isString(jsonObj)) {
      return;
    } else if (utils.isObject(jsonObj)) {
      for (const [key, value] of Object.entries(jsonObj)) {
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
        if (match === null) break;
        if (!params.includes(match[1])) params.push(match[1]);
      }
      return new FunctionType(params);
    } else if (utils.isObject(jsonObj)) {
      const map = new Map<string, BaseType>();
      for (const [key, value] of Object.entries(jsonObj)) {
        const memberVarName = utils.memberVarName(varName, key);
        const valueTypeObj = LangFileConverter.jsonObjToTypeObjRecursively(lang, value, memberVarName);
        map.set(key, valueTypeObj);
      }
      return new ObjectType(map);
    } else {
      throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
    }
  }
}

class ObjectAnalyzer {
  static analyze(typeObj: BaseType, lang: string, jsonObj: unknown, defaultJsonObj: unknown): void {
    if (jsonObj == defaultJsonObj) return;
    ObjectAnalyzer.analyzeRecursively(typeObj, lang, jsonObj, '', defaultJsonObj);
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
        if (match === null) break;
        if (!typeObj.params.includes(match[1])) typeObj.params.push(match[1]);
      }
    } else if (typeObj instanceof ObjectType) {
      if (!utils.isObject(defaultJsonObj)) throw new Error(ErrorMessages.unreachable());
      if (!utils.isObject(jsonObj)) throw new Error(ErrorMessages.varShouldObject(lang, varName));
      const [keys, defaultKeys] = [Object.keys(jsonObj), Object.keys(defaultJsonObj)];
      const excessKeys = utils.arrayDiff(keys, defaultKeys);
      const lackedKeys = utils.arrayDiff(defaultKeys, keys);
      const sharedKeys = utils.arrayIntersect(keys, defaultKeys);
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
        const memberTypeObj = typeObj.map.get(key);
        if (!memberTypeObj) throw new Error(ErrorMessages.unreachable());
        ObjectAnalyzer.analyzeRecursively(memberTypeObj, lang, jsonObj[key], memberVarName, defaultJsonObj[key]);
      }
    } else {
      throw new Error(ErrorMessages.unreachable());
    }
  }
}

class CodeGenerator {
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
    } else {
      throw new Error(ErrorMessages.varShouldStringOrObject(lang, varName));
    }
  }

  private static typeObjToCode(typeObj: BaseType, varName: string): string {
    if (typeObj instanceof FunctionType) {
      let delimiter = '';
      let declaration = 'function (';
      for (const param of typeObj.params) {
        declaration += `${delimiter}${param}: string`;
        delimiter = ', ';
      }
      declaration += '): string';
      let expr = varName;
      for (const param of typeObj.params) {
        expr += `.replace(/\\$\\{${param}\\}/g, ${param})`;
      }
      return `${declaration} { return ${expr}; }`;
    } else if (typeObj instanceof ObjectType) {
      let members = '';
      for (const [key, value] of typeObj.map) {
        const memberVarName = utils.memberVarName(varName, key);
        const valueCode = CodeGenerator.typeObjToCode(value, memberVarName);
        members += `${key}: ${valueCode}, `;
      }
      return `{ ${members} }`;
    } else {
      throw new Error('UNREACHABLE: this may be a bug! please let us know');
    }
  }

  private static currentLangChangerCode(langs: string[], varCurrentLang: string): string {
    const varLang = 'lang';
    let delimiter = '';
    let declaration = `function changeCurrentLang(${varLang}: `;
    for (const lang of langs) {
      declaration += `${delimiter}"${lang}"`;
      delimiter = ' | ';
    }
    declaration += '): void';
    let statement = `switch (${varLang}) { `;
    for (const lang of langs) {
      statement += `case "${lang}": ${varCurrentLang} = ${lang}; break; `;
    }
    statement += ' }';

    return `${declaration} { ${statement} }`;
  }
}

function main(): void {
  const { indir, outfile, defaultLang } = yargs.options({
    indir: { type: 'string', alias: 'i' },
    outfile: { type: 'string', alias: 'o' },
    defaultLang: { type: 'string', alias: 'd' },
  }).argv;

  if (!indir || !outfile || !defaultLang) throw new Error(ErrorMessages.usage());

  const langFilepaths = fs
    .readdirSync(indir)
    .filter((fileName) => /^.*\.json$/.test(fileName))
    .map((langFileName) => path.join(indir, langFileName));

  const defaultLangFilepath = path.join(indir, utils.langToFilename(defaultLang));

  if (!langFilepaths.includes(defaultLangFilepath)) throw new Error(ErrorMessages.noDefaultLangFile());

  const typeObj = LangFileConverter.toTypeObj(defaultLangFilepath);
  const defaultJsonObj = LangFileConverter.toJsonObj(defaultLangFilepath);

  const jsonObjMap: { [lang: string]: unknown } = {};
  for (const langFilepath of langFilepaths) {
    const lang = utils.filepathToLang(langFilepath);
    const jsonObj = LangFileConverter.toJsonObj(langFilepath);
    ObjectAnalyzer.analyze(typeObj, lang, jsonObj, defaultJsonObj);
    jsonObjMap[lang] = jsonObj;
  }

  const code = CodeGenerator.gen(typeObj, jsonObjMap, defaultLang);
  fs.writeFileSync(outfile, code, { encoding: 'utf-8' });
}

main();
