import path from 'node:path';

import { genI18ts } from '../src';

/* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('basic use case', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'basicUse');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'basicUseI18n.ts');
  await genI18ts(inputDir, outFile, 'en');

  const { changeLanguageByCode, i18n } = require('../test-fixtures/basicUseI18n');

  expect(i18n.okButtonName()).toBe('Done');
  expect(i18n.welcome('Taro')).toBe('Hi, Taro');
  expect(i18n.pages.user('Taro')).toBe("Taro's page");
  expect(i18n.pages.help()).toBe('Help');

  changeLanguageByCode('ja');
  expect(i18n.okButtonName()).toBe('完了');
  expect(i18n.welcome('太郎')).toBe('こんにちは、太郎さん');
  expect(i18n.pages.user('太郎')).toBe('太郎さんのページ');
  expect(i18n.pages.contact()).toBe('お問い合わせ');
});
