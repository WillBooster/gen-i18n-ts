import assert from 'assert';

import { i18n, changeCurrentLang } from '../test-fixtures/temp/i18n-6';

test('i18n-6: tricky arguments', async () => {
  assert(i18n.test('b', 'a') === 'b and a');
  assert(i18n.test('${b}', 'a') === '${b} and a');
  assert(i18n.test('b', '${a}') === 'b and ${a}');
  assert(i18n.test('${b}', '${a}') === '${b} and ${a}');

  changeCurrentLang('ja');
  assert(i18n.test('b', 'a') === 'b と a');
  assert(i18n.test('${b}', 'a') === '${b} と a');
  assert(i18n.test('b', '${a}') === 'b と ${a}');
  assert(i18n.test('${b}', '${a}') === '${b} と ${a}');
});
