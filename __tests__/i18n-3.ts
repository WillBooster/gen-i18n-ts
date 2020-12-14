import assert from 'assert';

import { i18n, changeCurrentLang } from '../test-fixtures/temp/i18n-3';

test('i18n-3: using a variable multiple times', async () => {
  assert(i18n.twice('hey!') === 'hey!, again hey!');

  changeCurrentLang('ja');
  assert(i18n.twice('おーい！') === 'おーい！、もう一回 おーい！');
});
