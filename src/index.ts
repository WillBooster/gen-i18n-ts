import fs from 'node:fs';
import path from 'node:path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { generate } from './codeGenerator.js';
import { ErrorMessages, InfoMessages } from './constants.js';
import { toLangObj, toTypeObj } from './langFileConverter.js';
import { analyze } from './objectAnalyzer.js';

export async function cli(): Promise<void> {
  const { defaultLang, global, inputDir, outfile, watch } = await yargs(hideBin(process.argv))
    .scriptName('gen-i18n-ts')
    .options({
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
      global: {
        type: 'boolean',
        alias: 'g',
        describe: 'Generate with global state (currentLang variable)',
        default: false,
      },
    })
    .strict()
    .version(getVersion())
    .help().argv;

  await genI18ts(inputDir, outfile, defaultLang, global);
  if (watch) {
    console.info();
    console.info('Start monitoring i18n file changes.');
    fs.watch(inputDir, async (event, fileName) => {
      if (!fileName?.endsWith('.json')) return;

      console.info(`### Detect changes in ${inputDir} (${event} on ${fileName}) ###`);
      try {
        await genI18ts(inputDir, outfile, defaultLang, global);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

function getVersion(): string {
  let packageJsonDir = path.dirname(new URL(import.meta.url).pathname);
  while (!fs.existsSync(path.join(packageJsonDir, 'package.json'))) {
    packageJsonDir = path.dirname(packageJsonDir);
  }
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageJsonDir, 'package.json'), 'utf8')) as {
    version: string;
  };
  return packageJson.version;
}

async function genI18ts(inputDir: string, outfile: string, defaultLang: string, global: boolean): Promise<void> {
  const fileNames = await fs.promises.readdir(inputDir);
  const langFileNames = fileNames.filter((fileName) => ['.json', '.yaml', '.yml'].includes(path.extname(fileName)));

  const langToPath = new Map<string, string>();
  for (const fileName of langFileNames) {
    const lang = path.parse(fileName).name;
    const existingLangPath = langToPath.get(lang);
    if (existingLangPath) throw new Error(ErrorMessages.duplicatedLangFile(existingLangPath, fileName));
    langToPath.set(lang, path.join(inputDir, fileName));
  }

  const defaultLangPath = langToPath.get(defaultLang);
  if (!defaultLangPath) throw new Error(ErrorMessages.noDefaultLangFile());

  const typeObj = toTypeObj(defaultLang, defaultLangPath);
  const defaultLangObj = toLangObj(defaultLang, defaultLangPath);

  const langToLangObj = new Map<string, unknown>([[defaultLang, defaultLangObj]]);
  for (const [lang, langFilePath] of langToPath.entries()) {
    if (lang === defaultLang) continue;
    console.info(InfoMessages.analyzingLangFile(langFilePath));
    const langObj = toLangObj(defaultLang, langFilePath);
    analyze(typeObj, lang, langObj, defaultLangObj);
    langToLangObj.set(lang, langObj);
  }
  if (!langToLangObj.has(defaultLang)) throw new Error(ErrorMessages.noDefaultLangFile());

  const code = generate(typeObj, langToLangObj, defaultLang, global);
  await fs.promises.mkdir(path.dirname(outfile), { recursive: true });
  await fs.promises.writeFile(outfile, code, { encoding: 'utf8' });
  console.info('Generated TypeScript code.');
}

await cli();
