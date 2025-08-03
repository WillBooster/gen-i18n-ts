import fs from 'node:fs';
import path from 'node:path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { genI18ts } from './index.js';

export async function cli(): Promise<void> {
  const { defaultLang, inputDir, outfile, watch } = await yargs(hideBin(process.argv))
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
    })
    .strict()
    .version(getVersion())
    .help().argv;

  await genI18ts(inputDir, outfile, defaultLang);
  if (watch) {
    console.info();
    console.info('Start monitoring i18n file changes.');
    fs.watch(inputDir, async (event, fileName) => {
      if (!fileName?.endsWith('.json')) return;

      console.info(`### Detect changes in ${inputDir} (${event} on ${fileName}) ###`);
      try {
        await genI18ts(inputDir, outfile, defaultLang);
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

await cli();
