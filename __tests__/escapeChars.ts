import path from 'path';

import { genI18ts } from '../src';

test('escape characters', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'escapeChars');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'escapeCharsI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/escapeCharsI18n');

  expect(i18n.escape()).toBe('This is the first line.\nThis is the second line. And Here is \t, a tab character!');
  changeLanguageByCode('ja');
  expect(i18n.escape()).toBe('これは1行目。\nこれは2行目。そして、ここに \t タブ文字！');
});
