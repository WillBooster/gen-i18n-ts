import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

test('tricky arguments', () => {
  const inputDir = path.resolve('test-fixtures', 'trickyArgs');
  const outFile = path.resolve('temp', 'trickyArgsI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--global']);

  const { changeLanguageByCode, i18n } = require('../temp/trickyArgsI18n');

  expect(i18n.test({ a: 'b', b: 'a' })).toBe('b and a');
  expect(i18n.test({ a: '${b}', b: 'a' })).toBe('${b} and a');
  expect(i18n.test({ a: 'b', b: '${a}' })).toBe('b and ${a}');
  expect(i18n.test({ a: '${b}', b: '${a}' })).toBe('${b} and ${a}');

  changeLanguageByCode('ja');
  expect(i18n.test({ a: 'b', b: 'a' })).toBe('b と a');
  expect(i18n.test({ a: '${b}', b: 'a' })).toBe('${b} と a');
  expect(i18n.test({ a: 'b', b: '${a}' })).toBe('b と ${a}');
  expect(i18n.test({ a: '${b}', b: '${a}' })).toBe('${b} と ${a}');
});
