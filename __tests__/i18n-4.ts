import assert from 'assert';
import { i18n, changeCurrentLang } from '../test-fixtures/temp/i18n-4';

test('i18n-4: lacked and excess keys', async () => {
  assert(i18n.lang() == 'English');
  assert(i18n.lack() == 'lacked');
  assert(i18n.nested.member() == 'member');
  assert(i18n.nested.lack() == 'lacked too');
  assert(i18n.nestedLack.a() == 'a');
  assert(i18n.nestedLack.b() == 'b');

  changeCurrentLang('ja');
  assert(i18n.lang() == '日本語');
  assert(i18n.lack() == 'lacked');
  assert(i18n.nested.member() == 'メンバー');
  assert(i18n.nested.lack() == 'lacked too');
  assert(i18n.nestedLack.a() == 'a');
  assert(i18n.nestedLack.b() == 'b');
});
