import assert from 'assert';
import path from 'path';

import { genI18ts } from '../src';

test('i18n-2: multiple arguments', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-2');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'i18n-2.ts');
  genI18ts(inputDir, outFile, 'en');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n, changeLanguageByCode } = require('../test-fixtures/i18n-2');

  assert(i18n.gotAMail('Hanako', 'Happy Birthday!') === 'You got a mail! From:Hanako Subject:Happy Birthday!');
  assert(i18n.gotAMail('WB Store', 'Special Discount') === 'You got a mail! From:WB Store Subject:Special Discount');
  assert(i18n.fx('sin', 'theta') === 'sin of theta');

  changeLanguageByCode('ja');
  assert(i18n.gotAMail('花子', '誕生日おめでとう!') === 'メールを受信しました! 送信者:花子 件名:誕生日おめでとう!');
  assert(i18n.gotAMail('WB Store', '特別割引') === 'メールを受信しました! 送信者:WB Store 件名:特別割引');
  assert(i18n.fx('正弦(sin)', 'シータ') === 'シータ の関数 正弦(sin)');

  changeLanguageByCode('en');
  assert(i18n.fourAnd('apple', 'orange', 'banana', 'peach') === 'apple, orange, banana and peach');

  changeLanguageByCode('ja');
  assert(i18n.fourAnd('りんご', 'みかん', 'バナナ', 'モモ') === 'りんご と みかん と バナナ と モモ');
});
