import path from 'path';

import { genI18ts } from '../src';

test('i18n-4: lacked and excess keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-4');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-4.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-4');

  expect(i18n.lang()).toBe('English');
  expect(i18n.lack()).toBe('lacked');
  expect(i18n.nested.member()).toBe('member');
  expect(i18n.nested.lack()).toBe('lacked too');
  expect(i18n.nestedLack.a()).toBe('a');
  expect(i18n.nestedLack.b()).toBe('b');

  changeLanguageByCode('ja');
  expect(i18n.lang()).toBe('日本語');
  expect(i18n.lack()).toBe('lacked');
  expect(i18n.nested.member()).toBe('メンバー');
  expect(i18n.nested.lack()).toBe('lacked too');
  expect(i18n.nestedLack.a()).toBe('a');
  expect(i18n.nestedLack.b()).toBe('b');
});
