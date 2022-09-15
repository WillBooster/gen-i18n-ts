import path from 'node:path';

import { genI18ts } from '../src';

test('filename with hyphen', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'fileWithHyphen');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'fileWithHyphenI18n.ts');
  genI18ts(inputDir, outFile, 'en-us');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { changeLanguageByCode, i18n } = require('../test-fixtures/fileWithHyphenI18n');

  expect(i18n.color()).toBe('color');

  changeLanguageByCode('en-gb');
  expect(i18n.color()).toBe('colour');

  changeLanguageByCode('ja');
  expect(i18n.color()).toBe('色');
});
