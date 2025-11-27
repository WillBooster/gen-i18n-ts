import * as child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

test('non-global mode (function with language parameter)', () => {
  const inputDir = path.resolve('test-fixtures', 'basicUse');
  const outFile = path.resolve('temp', 'nonGlobalModeI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--no-global']);

  const exported = require('../temp/nonGlobalModeI18n');

  expect(typeof exported.i18n).toBe('function');
  expect(exported.changeLanguageByCode).toBeUndefined();
  expect(exported.getCurrentLanguageCode).toBeUndefined();

  const enI18n = exported.i18n('en');
  expect(enI18n.okButtonName()).toBe('Done');
  expect(enI18n.welcome({ userName: 'Taro' })).toBe('Hi, Taro');
  expect(enI18n.pages.user({ userName: 'Taro' })).toBe("Taro's page");
  expect(enI18n.pages.help()).toBe('Help');

  const jaI18n = exported.i18n('ja');
  expect(jaI18n.okButtonName()).toBe('完了');
  expect(jaI18n.welcome({ userName: '太郎' })).toBe('こんにちは、太郎さん');
  expect(jaI18n.pages.user({ userName: '太郎' })).toBe('太郎さんのページ');
  expect(jaI18n.pages.contact()).toBe('お問い合わせ');

  expect(() => exported.i18n('invalid')).toThrow('Language "invalid" not found');
});
