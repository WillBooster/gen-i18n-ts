import path from 'node:path';

import { genI18ts } from '../src';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('escape characters', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'escapeChars');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'escapeCharsI18n.ts');
  await genI18ts(inputDir, outFile, 'en');

  const { changeLanguageByCode, i18n } = require('../test-fixtures/escapeCharsI18n');

  expect(i18n.escape()).toBe('This is the first line.\nThis is the second line. And Here is \t, a tab character!');
  changeLanguageByCode('ja');
  expect(i18n.escape()).toBe('これは1行目。\nこれは2行目。そして、ここに \t タブ文字！');
});
