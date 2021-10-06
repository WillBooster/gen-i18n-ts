import path from 'path';

import { genI18ts } from '../src';

test('i18n-10: numeric key', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-10');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-10.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-10');

  expect(i18n['123456']()).toBe('numeric key');

  changeLanguageByCode('ja');
  expect(i18n['123456']()).toBe('数値的なキー');
});
