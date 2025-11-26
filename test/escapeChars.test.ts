import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module */

test('escape characters', async () => {
  const inputDir = path.resolve('test-fixtures', 'escapeChars');
  const outFile = path.resolve('temp', 'escapeCharsI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--global']);

  const { changeLanguageByCode, i18n } = require('../temp/escapeCharsI18n');

  expect(i18n.escape()).toBe('This is the first line.\nThis is the second line. And Here is \t, a tab character!');
  changeLanguageByCode('ja');
  expect(i18n.escape()).toBe('これは1行目。\nこれは2行目。そして、ここに \t タブ文字！');
});
