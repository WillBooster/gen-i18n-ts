import path from 'node:path';

import { genI18ts } from '../src';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('multiple arguments', async () => {
  const inputDir = path.resolve(__dirname, '..', 'test-fixtures', 'multiArgs');
  const outFile = path.resolve(__dirname, '..', 'test-fixtures', 'multiArgsI18n.ts');
  await genI18ts(inputDir, outFile, 'en');

  const { changeLanguageByCode, i18n } = require('../test-fixtures/multiArgsI18n');

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
