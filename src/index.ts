import fs from 'node:fs';
import path from 'node:path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { generate, generateNextHelper, generateNextServerHelper } from './codeGenerator.js';
import { ErrorMessages, InfoMessages } from './constants.js';
import { toLangObj, toTypeObj } from './langFileConverter.js';
import { analyze } from './objectAnalyzer.js';

export async function cli(): Promise<void> {
  const { defaultLang, global, inputDir, next, outfile, watch } = await yargs(hideBin(process.argv))
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
      next: {
        type: 'boolean',
        describe: 'Generate Next.js client helpers. Defaults to auto-detecting Next.js from package.json.',
      },
    })
    .strict()
    .version(getVersion())
    .help().argv;

  await genI18ts(inputDir, outfile, defaultLang, global, next);
  if (watch) {
    console.info();
    console.info('Start monitoring i18n file changes.');
    fs.watch(inputDir, async (event, fileName) => {
      if (!fileName?.endsWith('.json')) return;

      console.info(`### Detect changes in ${inputDir} (${event} on ${fileName}) ###`);
      try {
        await genI18ts(inputDir, outfile, defaultLang, global, next);
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

async function genI18ts(
  inputDir: string,
  outfile: string,
  defaultLang: string,
  global: boolean,
  next: boolean | undefined
): Promise<void> {
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
  if (next ?? (await targetUsesNextJs(outfile))) {
    if (global) {
      throw new Error(
        'Next.js helpers require non-global mode. Remove --global to avoid sharing one i18n instance across users.'
      );
    }
    const nextHelperOutfile = getNextHelperOutfile(outfile);
    const i18nImportPath = getRelativeImportPath(path.dirname(nextHelperOutfile), outfile);
    await fs.promises.writeFile(nextHelperOutfile, generateNextHelper(i18nImportPath, global), { encoding: 'utf8' });
    const nextServerHelperOutfile = getNextServerHelperOutfile(outfile);
    await fs.promises.writeFile(nextServerHelperOutfile, generateNextServerHelper(i18nImportPath), {
      encoding: 'utf8',
    });
  }
  console.info('Generated TypeScript code.');
}

function getNextHelperOutfile(outfile: string): string {
  const parsedPath = path.parse(outfile);
  return path.join(parsedPath.dir, `${parsedPath.name}.next.tsx`);
}

function getNextServerHelperOutfile(outfile: string): string {
  const parsedPath = path.parse(outfile);
  return path.join(parsedPath.dir, `${parsedPath.name}.next.server.ts`);
}

function getRelativeImportPath(fromDir: string, toFile: string): string {
  const parsedToFile = path.parse(toFile);
  const toFileWithoutExtension = path.join(parsedToFile.dir, parsedToFile.name);
  const relativePath = path.relative(fromDir, toFileWithoutExtension).replaceAll(path.sep, '/');
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

async function targetUsesNextJs(outfile: string): Promise<boolean> {
  const packageJsonPath = await findNearestPackageJson(path.resolve(path.dirname(outfile)));
  if (!packageJsonPath) return false;

  const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
  };
  return [
    packageJson.dependencies,
    packageJson.devDependencies,
    packageJson.peerDependencies,
    packageJson.optionalDependencies,
  ].some((dependencies) => !!dependencies?.next);
}

async function findNearestPackageJson(startDir: string): Promise<string | undefined> {
  let currentDir = startDir;
  while (true) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) return packageJsonPath;

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) return undefined;
    currentDir = parentDir;
  }
}

await cli();
