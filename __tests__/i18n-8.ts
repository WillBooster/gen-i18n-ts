import assert from 'assert';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-8: yaml format', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-8');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-8.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-8');

  assert(i18n.okButtonName() === 'Done');
  assert(i18n.welcome('Taro') === 'Hi, Taro');
  assert(i18n.pages.user('Taro') === "Taro's page");
  assert(i18n.pages.help() === 'Help');

  changeLanguageByCode('ja');
  assert(i18n.okButtonName() === '完了');
  assert(i18n.welcome('太郎') === 'こんにちは、太郎さん');
  assert(i18n.pages.user('太郎') === '太郎さんのページ');
  assert(i18n.pages.contact() === 'お問い合わせ');
});
