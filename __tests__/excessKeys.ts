import path from 'node:path';

import { genI18ts } from '../src';

/* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('excess keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'excessKeys');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'excessKeysI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  const { changeLanguageByCode, i18n } = require('../test-fixtures/excessKeysI18n');

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
