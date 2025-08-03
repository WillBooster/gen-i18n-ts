import child_process from 'node:child_process';
import path from 'node:path';


/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('filename with hyphen', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'fileWithHyphen');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'fileWithHyphenI18n.ts');
  child_process.spawnSync('yarn', ['-i', inputDir, '-o', outFile, '-d', 'en-us']);

  const { changeLanguageByCode, i18n } = require('../test-fixtures/fileWithHyphenI18n');

  expect(i18n.color()).toBe('color');

  changeLanguageByCode('en-gb');
  expect(i18n.color()).toBe('colour');

  changeLanguageByCode('ja');
  expect(i18n.color()).toBe('色');
});
