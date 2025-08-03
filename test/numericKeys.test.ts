import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('numeric keys', async () => {
  const inputDir = path.resolve('test-fixtures', 'numericKeys');
  const outFile = path.resolve('temp', 'numericKeysI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en']);

  const { changeLanguageByCode, i18n } = require('../temp/numericKeysI18n');

  expect(i18n['123456']()).toBe('numeric key');

  changeLanguageByCode('ja');
  expect(i18n['123456']()).toBe('数値的なキー');
});
