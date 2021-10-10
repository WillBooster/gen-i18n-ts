import path from 'path';

import { genI18ts } from '../src';

test('i18n-5: function params', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-5');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-5.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-5');

  expect(i18n.morning('sunny', 'Taro')).toBe("It's sunny today. Good morning!");
  expect(i18n.hello('Taro')).toBe('Hello, Taro!');

  changeLanguageByCode('ja');
  expect(i18n.morning('晴れ', '太郎')).toBe('今日の天気は晴れです。おはようございます！太郎さん');
  expect(i18n.hello('太郎')).toBe('こんにちは！');
});
