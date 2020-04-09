import assert from 'assert';
import { i18n, changeCurrentLang } from '../test-fixtures/i18n-1/i18n';

test('i18n-1: simple website', async () => {
  assert(i18n.okButtonName() === 'Done');
  assert(i18n.welcome('Taro') === 'Hi, Taro');
  assert(i18n.pages.user('Taro') === "Taro's page");
  assert(i18n.pages.help() === 'Help');

  changeCurrentLang('ja');
  assert(i18n.okButtonName() === '完了');
  assert(i18n.welcome('太郎') === 'こんにちは、太郎さん');
  assert(i18n.pages.user('太郎') === '太郎さんのページ');
  assert(i18n.pages.contact() === 'お問い合わせ');
});
