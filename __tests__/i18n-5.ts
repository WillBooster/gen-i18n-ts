import assert from 'assert';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-5: function params', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-5');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-5.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-5');

  assert(i18n.morning('sunny', 'Taro') === "It's sunny today. Good morning!");
  assert(i18n.hello('Taro') === 'Hello, Taro!');

  changeLanguageByCode('ja');
  assert(i18n.morning('晴れ', '太郎') === '今日の天気は晴れです。おはようございます！太郎さん');
  assert(i18n.hello('太郎') === 'こんにちは！');
});
