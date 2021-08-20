import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-7: escape characters', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-7');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-7.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-7');

  assert(i18n.escape() === 'This is the first line.\nThis is the second line. And Here is \t, a tab character!');
  changeLanguageByCode('ja');
  assert(i18n.escape() === 'これは1行目。\nこれは2行目。そして、ここに \t タブ文字！');
});
