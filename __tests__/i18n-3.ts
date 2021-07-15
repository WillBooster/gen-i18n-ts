import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-3: using a variable multiple times', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-3');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-3.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Auto-generated module
  // eslint-disable-next-line import/no-unresolved
  const { i18n, changeCurrentLang } = await require('../test-fixtures/i18n-3');

  assert(i18n.twice('hey!') === 'hey!, again hey!');

  changeCurrentLang('ja');
  assert(i18n.twice('おーい！') === 'おーい！、もう一回 おーい！');

  fs.unlinkSync(outFile);
});
