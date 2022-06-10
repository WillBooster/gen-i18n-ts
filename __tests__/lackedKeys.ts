import path from 'path';

import { genI18ts } from '../src';

test('lacked keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'lackedKeys');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'lackedKeysI18n.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { changeLanguageByCode, i18n } = require('../test-fixtures/lackedKeysI18n');

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
