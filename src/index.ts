import fs from 'fs';
import path from 'path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { CodeGenerator } from './codeGenerator';
import { ErrorMessages, InfoMessages, VARIABLE_REGEX } from './constants';
import { ObjectAnalyzer } from './objectAnalyzer';
import { BaseType, FunctionType, ObjectType } from './types';
import * as utils from './utils';

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

export function geni18ts(indir: string, outfile: string, defaultLang: string): void {
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
    console.info(InfoMessages.analyzingLangFile(langFilepath));
    const lang = utils.filepathToLang(langFilepath);
    const jsonObj = LangFileConverter.toJsonObj(langFilepath);
    ObjectAnalyzer.analyze(typeObj, lang, jsonObj, defaultJsonObj);
    jsonObjMap[lang] = jsonObj;
  }

  const code = CodeGenerator.gen(typeObj, jsonObjMap, defaultLang);
  fs.writeFileSync(outfile, code, { encoding: 'utf-8' });
}

if (require !== undefined && require.main === module) {
  const { indir, outfile, defaultLang } = yargs(hideBin(process.argv)).options({
    indir: { type: 'string', alias: 'i' },
    outfile: { type: 'string', alias: 'o' },
    defaultLang: { type: 'string', alias: 'd' },
  }).argv;

  if (!indir || !outfile || !defaultLang) throw new Error(ErrorMessages.usage());

  geni18ts(indir, outfile, defaultLang);
}
