import assert from 'assert';
import path from 'path';

import { genI18ts } from '../src';
import { changeLanguageByCode, i18n } from '../test-fixtures/i18n-2';

test('i18n-2: multiple arguments', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-2');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-2.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-2');

  expect(i18n.gotAMail('Hanako', 'Happy Birthday!')).toBe('You got a mail! From:Hanako Subject:Happy Birthday!');
  expect(i18n.gotAMail('WB Store', 'Special Discount')).toBe('You got a mail! From:WB Store Subject:Special Discount');
  expect(i18n.fx('sin', 'theta')).toBe('sin of theta');

  changeLanguageByCode('ja');
  expect(i18n.gotAMail('花子', '誕生日おめでとう!')).toBe('メールを受信しました! 送信者:花子 件名:誕生日おめでとう!');
  expect(i18n.gotAMail('WB Store', '特別割引')).toBe('メールを受信しました! 送信者:WB Store 件名:特別割引');
  expect(i18n.fx('正弦(sin)', 'シータ')).toBe('シータ の関数 正弦(sin)');

  changeLanguageByCode('en');
  expect(i18n.fourAnd('apple', 'orange', 'banana', 'peach')).toBe('apple, orange, banana and peach');

  changeLanguageByCode('ja');
  expect(i18n.fourAnd('りんご', 'みかん', 'バナナ', 'モモ')).toBe('りんご と みかん と バナナ と モモ');
});
