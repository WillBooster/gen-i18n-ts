import fs from 'node:fs';
import path from 'node:path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { CodeGenerator } from './codeGenerator';
import { ErrorMessages, InfoMessages } from './constants';
import { LangFileConverter } from './langFileConverter';
import { ObjectAnalyzer } from './objectAnalyzer';

export async function cli(argv: string[]): Promise<void> {
  const { defaultLang, inputDir, outfile, watch } = await yargs(hideBin(argv)).options({
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

  genI18ts(inputDir, outfile, defaultLang);
  if (watch) {
    console.info();
    console.info('Start monitoring i18n file changes.');
    fs.watch(inputDir, (event, fileName) => {
      if (!fileName.endsWith('.json')) return;
      console.info(`### Detect changes in ${inputDir} (${event} on ${fileName}) ###`);
      genI18ts(inputDir, outfile, defaultLang);
    });
  }
}

export function genI18ts(inputDir: string, outfile: string, defaultLang: string): void {
  const langFileNames = fs
    .readdirSync(inputDir)
    .filter((fileName) => ['.json', '.yaml', '.yml'].includes(path.extname(fileName)));
  const langToPath = new Map<string, string>();
  for (const fileName of langFileNames) {
    const lang = path.parse(fileName).name;
    const existingLangPath = langToPath.get(lang);
    if (existingLangPath) throw new Error(ErrorMessages.duplicatedLangFile(existingLangPath, fileName));
    langToPath.set(lang, path.join(inputDir, fileName));
  }

  const defaultLangPath = langToPath.get(defaultLang);
  if (!defaultLangPath) throw new Error(ErrorMessages.noDefaultLangFile());

  const typeObj = LangFileConverter.toTypeObj(defaultLang, defaultLangPath);
  const defaultLangObj = LangFileConverter.toLangObj(defaultLang, defaultLangPath);

  const langToLangObj = new Map<string, unknown>([[defaultLang, defaultLangObj]]);
  for (const [lang, langFilePath] of langToPath.entries()) {
    if (lang === defaultLang) continue;
    console.info(InfoMessages.analyzingLangFile(langFilePath));
    const langObj = LangFileConverter.toLangObj(defaultLang, langFilePath);
    ObjectAnalyzer.analyze(typeObj, lang, langObj, defaultLangObj);
    langToLangObj.set(lang, langObj);
  }
  if (!langToLangObj.has(defaultLang)) throw new Error(ErrorMessages.noDefaultLangFile());

  const code = CodeGenerator.gen(typeObj, langToLangObj, defaultLang);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, code, { encoding: 'utf-8' });
  console.info('Generated TypeScript code.');
}
