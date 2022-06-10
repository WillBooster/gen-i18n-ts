import path from 'path';

import { genI18ts } from '../src';

test('yaml format', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'yamlFormat');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'yamlFormatI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { changeLanguageByCode, i18n } = require('../test-fixtures/yamlFormatI18n');

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
