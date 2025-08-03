import child_process from 'node:child_process';
import path from 'node:path';


/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('lacked keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'lackedKeys');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'lackedKeysI18n.ts');
  child_process.spawnSync('yarn', ['-i', inputDir, '-o', outFile, '-d', 'en']);

  const { changeLanguageByCode, i18n } = require('../test-fixtures/lackedKeysI18n');

  expect(i18n.lang()).toBe('English');
  expect(i18n.lack()).toBe('lacked');
  expect(i18n.nested.member()).toBe('member');
  expect(i18n.nested.lack()).toBe('lacked too');
  expect(i18n.nestedLack.a()).toBe('a');
  expect(i18n.nestedLack.b()).toBe('b');

  changeLanguageByCode('ja');
  expect(i18n.lang()).toBe('日本語');
  expect(i18n.lack()).toBe('lacked');
  expect(i18n.nested.member()).toBe('メンバー');
  expect(i18n.nested.lack()).toBe('lacked too');
  expect(i18n.nestedLack.a()).toBe('a');
  expect(i18n.nestedLack.b()).toBe('b');
});
