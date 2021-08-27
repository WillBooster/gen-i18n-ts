import path from 'path';

import { genI18ts } from '../src';
import { i18n } from '../test-fixtures/i18n-3';

test('i18n-3: using a variable multiple times', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-3');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-3.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-3');

  expect(i18n.twice('hey!')).toBe('hey!, again hey!');

  changeLanguageByCode('ja');
  expect(i18n.twice('おーい！')).toBe('おーい！、もう一回 おーい！');
});
