import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

test('excess keys', () => {
  const inputDir = path.resolve('test-fixtures', 'excessKeys');
  const outFile = path.resolve('temp', 'excessKeysI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--global']);

  const { changeLanguageByCode, i18n } = require('../temp/excessKeysI18n');

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
