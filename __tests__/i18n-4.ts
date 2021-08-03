import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-4: lacked and excess keys', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-4');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-4.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeCurrentLang } = require('../test-fixtures/i18n-4');

  assert(i18n.lang() === 'English');
  assert(i18n.lack() === 'lacked');
  assert(i18n.nested.member() === 'member');
  assert(i18n.nested.lack() === 'lacked too');
  assert(i18n.nestedLack.a() === 'a');
  assert(i18n.nestedLack.b() === 'b');

  changeCurrentLang('ja');
  assert(i18n.lang() === '日本語');
  assert(i18n.lack() === 'lacked');
  assert(i18n.nested.member() === 'メンバー');
  assert(i18n.nested.lack() === 'lacked too');
  assert(i18n.nestedLack.a() === 'a');
  assert(i18n.nestedLack.b() === 'b');
});
