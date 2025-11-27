import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

test('yaml format', () => {
  const inputDir = path.resolve('test-fixtures', 'yamlFormat');
  const outFile = path.resolve('temp', 'yamlFormatI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--global']);

  const { changeLanguageByCode, i18n } = require('../temp/yamlFormatI18n');

  expect(i18n.okButtonName()).toBe('Done');
  expect(i18n.welcome({ userName: 'Taro' })).toBe('Hi, Taro');
  expect(i18n.pages.user({ userName: 'Taro' })).toBe("Taro's page");
  expect(i18n.pages.help()).toBe('Help');

  changeLanguageByCode('ja');
  expect(i18n.okButtonName()).toBe('完了');
  expect(i18n.welcome({ userName: '太郎' })).toBe('こんにちは、太郎さん');
  expect(i18n.pages.user({ userName: '太郎' })).toBe('太郎さんのページ');
  expect(i18n.pages.contact()).toBe('お問い合わせ');
});
