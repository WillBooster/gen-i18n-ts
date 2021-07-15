import fs from 'fs';
import path from 'path';

import { CodeGenerator } from './codeGenerator';
import { ErrorMessages, InfoMessages } from './constants';
import { LangFileConverter } from './langFileConverter';
import { ObjectAnalyzer } from './objectAnalyzer';
import * as utils from './utils';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

export async function cli(argv: string[]): Promise<void> {
  const { inputDir, outfile, defaultLang, watch } = await yargs(hideBin(argv)).options({
    inputDir: {
      type: 'string',
      alias: 'i',
      describe: 'A path to input directory',
      demandOption: true,
    },
    outfile: {
      type: 'string',
      alias: 'o',
      describe: 'A path to output file',
      demandOption: true,
    },
    defaultLang: {
      type: 'string',
      alias: 'd',
      describe: 'A name of a default language',
      demandOption: true,
    },
    watch: {
      type: 'boolean',
      alias: 'w',
      describe: 'Enable watch mode',
    },
  }).argv;

  if (watch) {
    fs.watch(inputDir, (event, fileName) => {
      if (!fileName.endsWith('.json')) return;
      console.info(`Detect changes in ${inputDir} (${event} on ${fileName})`);
      genI18ts(inputDir, outfile, defaultLang);
    });
  } else {
    genI18ts(inputDir, outfile, defaultLang);
  }
}

export function genI18ts(inputDir: string, outfile: string, defaultLang: string): void {
  const langFilePaths = fs
    .readdirSync(inputDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((langFileName) => path.join(inputDir, langFileName));

  const defaultLangFilePath = path.join(inputDir, utils.langToFilename(defaultLang));

  if (!langFilePaths.includes(defaultLangFilePath)) throw new Error(ErrorMessages.noDefaultLangFile());

  const typeObj = LangFileConverter.toTypeObj(defaultLangFilePath);
  const defaultJsonObj = LangFileConverter.toJsonObj(defaultLangFilePath);

  const jsonObjMap: { [lang: string]: unknown } = {};
  for (const langFilePath of langFilePaths) {
    console.info(InfoMessages.analyzingLangFile(langFilePath));
    const lang = utils.filepathToLang(langFilePath);
    const jsonObj = LangFileConverter.toJsonObj(langFilePath);
    ObjectAnalyzer.analyze(typeObj, lang, jsonObj, defaultJsonObj);
    jsonObjMap[lang] = jsonObj;
  }

  const code = CodeGenerator.gen(typeObj, jsonObjMap, defaultLang);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, code, { encoding: 'utf-8' });
}
