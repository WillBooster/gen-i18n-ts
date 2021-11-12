import path from 'path';

import { genI18ts } from '../src';

test('excess keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'excessKeys');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'excessKeysI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/excessKeysI18n');

  expect(i18n.lang()).toBe('English');
  expect(i18n.excess).toBeUndefined();
  expect(i18n.nested.member()).toBe('member');
  expect(i18n.nested.excess).toBeUndefined();
  expect(i18n.nestedExcess).toBeUndefined();

  changeLanguageByCode('ja');
  expect(i18n.lang()).toBe('日本語');
  expect(i18n.excess).toBeUndefined();
  expect(i18n.nested.member()).toBe('メンバー');
  expect(i18n.nested.excess).toBeUndefined();
  expect(i18n.nestedExcess).toBeUndefined();
});