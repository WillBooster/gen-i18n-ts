import child_process from 'node:child_process';
import path from 'node:path';


/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('tricky arguments', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'trickyArgs');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'trickyArgsI18n.ts');
  child_process.spawnSync('yarn', ['-i', inputDir, '-o', outFile, '-d', 'en']);

  const { changeLanguageByCode, i18n } = require('../test-fixtures/trickyArgsI18n');

  expect(i18n.test('b', 'a')).toBe('b and a');
  expect(i18n.test('${b}', 'a')).toBe('${b} and a');
  expect(i18n.test('b', '${a}')).toBe('b and ${a}');
  expect(i18n.test('${b}', '${a}')).toBe('${b} and ${a}');

  changeLanguageByCode('ja');
  expect(i18n.test('b', 'a')).toBe('b と a');
  expect(i18n.test('${b}', 'a')).toBe('${b} と a');
  expect(i18n.test('b', '${a}')).toBe('b と ${a}');
  expect(i18n.test('${b}', '${a}')).toBe('${b} と ${a}');
});
