import path from 'path';

import { genI18ts } from '../src';

test('i18n-9: JSON filename with hyphen', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-9');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-9.ts');
  genI18ts(inputDir, outFile, 'en-us');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-9');

  expect(i18n.color()).toBe('color');

  changeLanguageByCode('en-gb');
  expect(i18n.color()).toBe('colour');

  changeLanguageByCode('ja');
  expect(i18n.color()).toBe('色');
});
