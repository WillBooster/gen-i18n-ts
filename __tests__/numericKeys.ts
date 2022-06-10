import path from 'path';

import { genI18ts } from '../src';

test('numeric keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'numericKeys');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'numericKeysI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { changeLanguageByCode, i18n } = require('../test-fixtures/numericKeysI18n');

  expect(i18n['123456']()).toBe('numeric key');

  changeLanguageByCode('ja');
  expect(i18n['123456']()).toBe('数値的なキー');
});
