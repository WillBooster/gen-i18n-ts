import path from 'node:path';

import { genI18ts } from '../src';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('numeric keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'numericKeys');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'numericKeysI18n.ts');
  await genI18ts(inputDir, outFile, 'en');

  const { changeLanguageByCode, i18n } = require('../test-fixtures/numericKeysI18n');

  expect(i18n['123456']()).toBe('numeric key');

  changeLanguageByCode('ja');
  expect(i18n['123456']()).toBe('数値的なキー');
});
