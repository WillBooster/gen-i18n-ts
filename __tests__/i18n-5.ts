import assert from 'assert';

import { i18n, changeCurrentLang } from '../test-fixtures/temp/i18n-5';

test('i18n-5: function params', async () => {
  assert(i18n.morning('sunny', 'Taro') === "It's sunny today. Good morning!");
  assert(i18n.hello('Taro') === 'Hello, Taro!');

  changeCurrentLang('ja');
  assert(i18n.morning('晴れ', '太郎') === '今日の天気は晴れです。おはようございます！太郎さん');
  assert(i18n.hello('太郎') === 'こんにちは！');
});
