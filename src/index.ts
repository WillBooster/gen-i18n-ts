import fs from 'node:fs';
import path from 'node:path';

import { CodeGenerator } from './codeGenerator.js';
import { ErrorMessages, InfoMessages } from './constants.js';
import { LangFileConverter } from './langFileConverter.js';
import { ObjectAnalyzer } from './objectAnalyzer.js';

export async function genI18ts(inputDir: string, outfile: string, defaultLang: string): Promise<void> {
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

  const code = CodeGenerator.generate(typeObj, langToLangObj, defaultLang);
  await fs.promises.mkdir(path.dirname(outfile), { recursive: true });
  await fs.promises.writeFile(outfile, code, { encoding: 'utf8' });
  console.info('Generated TypeScript code.');
}
