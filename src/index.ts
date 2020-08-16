import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';

import { BaseType, FunctionType, ObjectType } from './types';
import { isString, isObject, filepathToLang, langToFilename } from './utils';

class LangFileConverter {
  static toJsonObj(langFilepath: string): unknown {
    const lang = filepathToLang(langFilepath);
    const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
    LangFileConverter.validateJsonObj(lang, jsonObj);
    return jsonObj;
  }

  static toTypeObj(langFilepath: string): BaseType {
    const lang = filepathToLang(langFilepath);
    const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
    const typeObj = LangFileConverter.jsonObjToTypeObj(lang, jsonObj);
    return typeObj;
  }

  private static validateJsonObj(lang: string, jsonObj: unknown): void {
    if (!isObject(jsonObj)) {
      throw new Error(`${langToFilename(lang)}: JSON is not Object`);
    }

    LangFileConverter.validateJsonObjRecursively(lang, jsonObj, '');
  }

  private static validateJsonObjRecursively(lang: string, jsonObj: unknown, varName: string): void {
    if (isString(jsonObj)) {
      return;
    } else if (isObject(jsonObj)) {
      for (const [key, value] of Object.entries(jsonObj)) {
        const childVarName = varName != '' ? `${varName}.${key}` : key;
        LangFileConverter.validateJsonObjRecursively(lang, value, childVarName);
      }
    } else {
      throw new Error(`${langToFilename(lang)}: ${varName} is neigher string nor Object`);
    }
  }

  private static jsonObjToTypeObj(lang: string, jsonObj: unknown): BaseType {
    if (!isObject(jsonObj)) {
      throw new Error(`${langToFilename(lang)}: JSON is not Object`);
    }

    return LangFileConverter.jsonObjToTypeObjRecursively(lang, jsonObj, '');
  }

  private static jsonObjToTypeObjRecursively(lang: string, jsonObj: unknown, varName: string): BaseType {
    if (isString(jsonObj)) {
      const variableRegex = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
      const params: string[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = variableRegex.exec(jsonObj))) {
        if (match === null) break;
        if (!params.includes(match[1])) params.push(match[1]);
      }
      return new FunctionType(params);
    } else if (isObject(jsonObj)) {
      const map = new Map<string, BaseType>();
      for (const [key, value] of Object.entries(jsonObj)) {
        const childVarName = varName != '' ? `${varName}.${key}` : key;
        const valueTypeObj = LangFileConverter.jsonObjToTypeObjRecursively(lang, value, childVarName);
        map.set(key, valueTypeObj);
      }
      return new ObjectType(map);
    } else {
      throw new Error(`${langToFilename(lang)}: ${varName} is neigher string nor Object`);
    }
  }
}

class ObjectAnalyzer {
  static analyze(typeObj: BaseType, lang: string, jsonObj: unknown): void {
    ObjectAnalyzer.analyzeRecursively(typeObj, lang, jsonObj, '');
  }

  private static analyzeRecursively(typeObj: BaseType, lang: string, jsonObj: unknown, varName: string): void {
    if (typeObj instanceof FunctionType) {
      if (!isString(jsonObj)) {
        throw new Error(`${langToFilename(lang)}: ${varName} is expected to be string`);
      }
    } else if (typeObj instanceof ObjectType) {
      if (!isObject(jsonObj)) {
        throw new Error(`${langToFilename(lang)}: ${varName} is expected to be Object`);
      }
    } else {
      throw new Error('UNREACHABLE: this may be a bug! please let us know');
    }
  }
}

class CodeGenerator {
  static gen(typeObj: BaseType, jsonObjMap: { [lang: string]: unknown }, defaultLang: string): string {
    const langs = Object.keys(jsonObjMap);
    if (!langs.includes(defaultLang)) {
      throw new Error('Error: cannot find default-lang file');
    }

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
    if (!isObject(jsonObj)) {
      throw new Error(`${langToFilename(lang)}: JSON is not Object`);
    }

    return CodeGenerator.jsonObjToCodeRecursively(lang, jsonObj, '');
  }

  private static jsonObjToCodeRecursively(lang: string, jsonObj: unknown, varName: string): string {
    if (isString(jsonObj)) {
      return `"${jsonObj}"`;
    } else if (isObject(jsonObj)) {
      let members = '';
      for (const [key, value] of Object.entries(jsonObj)) {
        const childVarName = varName != '' ? `${varName}.${key}` : key;
        const valueCode = CodeGenerator.jsonObjToCodeRecursively(lang, value, childVarName);
        members += `${key}: ${valueCode}, `;
      }
      return `{ ${members} }`;
    }
    throw new Error(`${langToFilename(lang)}: ${varName} is neigher string nor object`);
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
        const childVarName = varName != '' ? `${varName}.${key}` : key;
        const valueCode = CodeGenerator.typeObjToCode(value, childVarName);
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

  if (!indir || !outfile || !defaultLang) {
    throw new Error('Usage: yarn start -i [dirpath] -o [filepath] -d [lang]');
  }

  const langFilepaths = fs
    .readdirSync(indir)
    .filter((fileName) => /^.*\.json$/.test(fileName))
    .map((langFileName) => path.join(indir, langFileName));

  const defaultLangFilepath = path.join(indir, langToFilename(defaultLang));

  if (!langFilepaths.includes(defaultLangFilepath)) {
    throw new Error('Error: cannot find default-lang file');
  }

  const typeObj = LangFileConverter.toTypeObj(defaultLangFilepath);
  const jsonObjMap: { [lang: string]: unknown } = {};
  for (const langFilepath of langFilepaths) {
    const lang = filepathToLang(langFilepath);
    const jsonObj = LangFileConverter.toJsonObj(langFilepath);
    ObjectAnalyzer.analyze(typeObj, lang, jsonObj);
    jsonObjMap[lang] = jsonObj;
  }

  const code = CodeGenerator.gen(typeObj, jsonObjMap, defaultLang);
  fs.writeFileSync(outfile, code, { encoding: 'utf-8' });
}

main();
