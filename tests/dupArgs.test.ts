import path from 'node:path';

import { genI18ts } from '../src';

/* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('using variable multiple times', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'dupArgs');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'dupArgsI18n.ts');
  await genI18ts(inputDir, outFile, 'en');

  const { changeLanguageByCode, i18n } = require('../test-fixtures/dupArgsI18n');

  expect(i18n.twice('hey!')).toBe('hey!, again hey!');

  changeLanguageByCode('ja');
  expect(i18n.twice('おーい！')).toBe('おーい！、もう一回 おーい！');
});
