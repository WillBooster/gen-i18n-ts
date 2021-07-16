const en = {
  welcome: 'Hi, ${userName}',
  lackedKey: "This key-value pair is copied to ja (en.json is the default and ja.json does not have 'lackedKey')",
};
const ja = {
  welcome: 'こんにちは、${userName}さん',
  lackedKey: "This key-value pair is copied to ja (en.json is the default and ja.json does not have 'lackedKey')",
  // Here! lackedKey in en.json is copied.
};
let currentLang = en;
export const i18n = {
  welcome: function (userName: string): string {
    const paramMap: Record<string, string> = { '${userName}': userName };
    return currentLang.welcome.replace(/\$\{userName\}/g, (pattern) => paramMap[pattern]);
  },
  lackedKey: function (): string {
    return currentLang.lackedKey;
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
