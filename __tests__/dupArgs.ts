import path from 'path';

import { genI18ts } from '../src';

test('using variable multiple times', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'dupArgs');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'dupArgsI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/dupArgsI18n');

  expect(i18n.twice('hey!')).toBe('hey!, again hey!');

  changeLanguageByCode('ja');
  expect(i18n.twice('おーい！')).toBe('おーい！、もう一回 おーい！');
});
