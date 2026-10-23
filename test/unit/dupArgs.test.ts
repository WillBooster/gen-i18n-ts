import child_process from 'node:child_process';
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

test('using variable multiple times', () => {
  const inputDir = path.resolve('test-fixtures', 'dupArgs');
  const outFile = path.resolve('temp', 'dupArgsI18n.ts');
  expect(child_process.spawnSync('bun', ['start', '-i', inputDir, '-o', outFile, '-d', 'en', '--global']).status).toBe(
    0
  );

  const { changeLanguageByCode, i18n } = require('../../temp/dupArgsI18n.ts');

  expect(i18n.twice({ x: 'hey!' })).toBe('hey!, again hey!');

  let reads = 0;
  expect(
    i18n.twice({
      get x() {
        return ++reads;
      },
    })
  ).toBe('1, again 1');

  changeLanguageByCode('ja');
  expect(i18n.twice({ x: 'おーい！' })).toBe('おーい！、もう一回 おーい！');
});
