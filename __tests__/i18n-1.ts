import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-1: simple website', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-1');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-1.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Auto-generated module
  // eslint-disable-next-line import/no-unresolved
  const { i18n, changeCurrentLang } = await require('../test-fixtures/i18n-1');

  assert(i18n.okButtonName() === 'Done');
  assert(i18n.welcome('Taro') === 'Hi, Taro');
  assert(i18n.pages.user('Taro') === "Taro's page");
  assert(i18n.pages.help() === 'Help');

  changeCurrentLang('ja');
  assert(i18n.okButtonName() === '完了');
  assert(i18n.welcome('太郎') === 'こんにちは、太郎さん');
  assert(i18n.pages.user('太郎') === '太郎さんのページ');
  assert(i18n.pages.contact() === 'お問い合わせ');

  fs.rmSync(outFile);
});
