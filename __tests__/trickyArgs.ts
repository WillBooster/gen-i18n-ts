import path from 'path';

import { genI18ts } from '../src';

test('tricky arguments', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'trickyArgs');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'trickyArgsI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/trickyArgsI18n');

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
