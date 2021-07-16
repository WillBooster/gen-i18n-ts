const en = {
  welcome: 'Hi, ${userName}',
};
const ja = {
  welcome: 'こんにちは、${userName}さん',
  // Here! excessKey is ignored in ja.json.
};
let currentLang = en;
export const i18n = {
  welcome: function (userName: string): string {
    const paramMap: Record<string, string> = { '${userName}': userName };
    return currentLang.welcome.replace(/\$\{userName\}/g, (pattern) => paramMap[pattern]);
  },
};
export function changeCurrentLang(lang: 'en' | 'ja'): void {
  switch (lang) {
    case 'en':
      currentLang = en;
      break;
    case 'ja':
      currentLang = ja;
      break;
  }
}
