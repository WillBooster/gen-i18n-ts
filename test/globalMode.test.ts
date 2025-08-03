import * as child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('global mode (explicit flag)', async () => {
  const inputDir = path.resolve('test-fixtures', 'basicUse');
  const outFile = path.resolve('temp', 'globalModeI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--global']);

  const { changeLanguageByCode, getCurrentLanguageCode, i18n } = require('../temp/globalModeI18n');

  expect(typeof changeLanguageByCode).toBe('function');
  expect(typeof getCurrentLanguageCode).toBe('function');
  expect(typeof i18n).toBe('object');

  expect(i18n.okButtonName()).toBe('Done');
  expect(i18n.welcome({ userName: 'Taro' })).toBe('Hi, Taro');
  expect(i18n.pages.user({ userName: 'Taro' })).toBe("Taro's page");
  expect(i18n.pages.help()).toBe('Help');

  expect(getCurrentLanguageCode()).toBe('en');

  changeLanguageByCode('ja');
  expect(getCurrentLanguageCode()).toBe('ja');
  expect(i18n.okButtonName()).toBe('完了');
  expect(i18n.welcome({ userName: '太郎' })).toBe('こんにちは、太郎さん');
  expect(i18n.pages.user({ userName: '太郎' })).toBe('太郎さんのページ');
  expect(i18n.pages.contact()).toBe('お問い合わせ');
});
