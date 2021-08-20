import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-6: tricky arguments', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-6');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-6.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-6');

  assert(i18n.test('b', 'a') === 'b and a');
  assert(i18n.test('${b}', 'a') === '${b} and a');
  assert(i18n.test('b', '${a}') === 'b and ${a}');
  assert(i18n.test('${b}', '${a}') === '${b} and ${a}');

  changeLanguageByCode('ja');
  assert(i18n.test('b', 'a') === 'b と a');
  assert(i18n.test('${b}', 'a') === '${b} と a');
  assert(i18n.test('b', '${a}') === 'b と ${a}');
  assert(i18n.test('${b}', '${a}') === '${b} と ${a}');
});
