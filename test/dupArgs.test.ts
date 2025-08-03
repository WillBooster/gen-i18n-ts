import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('using variable multiple times', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'dupArgs');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'dupArgsI18n.ts');
  child_process.spawnSync('yarn', ['-i', inputDir, '-o', outFile, '-d', 'en']);

  const { changeLanguageByCode, i18n } = require('../test-fixtures/dupArgsI18n');

  expect(i18n.twice('hey!')).toBe('hey!, again hey!');

  changeLanguageByCode('ja');
  expect(i18n.twice('おーい！')).toBe('おーい！、もう一回 おーい！');
});
