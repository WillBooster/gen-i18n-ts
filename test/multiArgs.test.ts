import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module */

test('multiple arguments', async () => {
  const inputDir = path.resolve('test-fixtures', 'multiArgs');
  const outFile = path.resolve('temp', 'multiArgsI18n.ts');
  child_process.spawnSync('yarn', ['start', '-i', inputDir, '-o', outFile, '-d', 'en']);

  const { changeLanguageByCode, i18n } = require('../temp/multiArgsI18n');

  expect(i18n.gotAMail({ sender: 'Hanako', subject: 'Happy Birthday!' })).toBe(
    'You got a mail! From:Hanako Subject:Happy Birthday!'
  );
  expect(i18n.gotAMail({ sender: 'WB Store', subject: 'Special Discount' })).toBe(
    'You got a mail! From:WB Store Subject:Special Discount'
  );
  expect(i18n.fx({ f: 'sin', x: 'theta' })).toBe('sin of theta');

  changeLanguageByCode('ja');
  expect(i18n.gotAMail({ sender: '花子', subject: '誕生日おめでとう!' })).toBe(
    'メールを受信しました! 送信者:花子 件名:誕生日おめでとう!'
  );
  expect(i18n.gotAMail({ sender: 'WB Store', subject: '特別割引' })).toBe(
    'メールを受信しました! 送信者:WB Store 件名:特別割引'
  );
  expect(i18n.fx({ f: '正弦(sin)', x: 'シータ' })).toBe('シータ の関数 正弦(sin)');

  changeLanguageByCode('en');
  expect(i18n.fourAnd({ a: 'apple', b: 'orange', c: 'banana', d: 'peach' })).toBe('apple, orange, banana and peach');

  changeLanguageByCode('ja');
  expect(i18n.fourAnd({ a: 'りんご', b: 'みかん', c: 'バナナ', d: 'モモ' })).toBe('りんご と みかん と バナナ と モモ');
});
