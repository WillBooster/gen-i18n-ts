import path from 'path';

import { genI18ts } from '../src';

test('i18n-1: simple website', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-1');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-1.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-1');

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
