const en = {
  okButtonName: 'Done',
  welcome: 'Hi, ${userName}',
  pages: { user: "${userName}'s page", help: 'Help', contact: 'Contact' },
};
const ja = {
  okButtonName: '完了',
  welcome: 'こんにちは、${userName}さん',
  pages: { user: '${userName}さんのページ', help: 'ヘルプ', contact: 'お問い合わせ' },
};
let currentLang = en;
export const i18n = {
  okButtonName: function (): string {
    return currentLang.okButtonName;
  },
  welcome: function (userName: string): string {
    const paramMap: Record<string, string> = { '${userName}': userName };
    return currentLang.welcome.replace(/\$\{userName\}/g, (pattern) => paramMap[pattern]);
  },
  pages: {
    user: function (userName: string): string {
      const paramMap: Record<string, string> = { '${userName}': userName };
      return currentLang.pages.user.replace(/\$\{userName\}/g, (pattern) => paramMap[pattern]);
    },
    help: function (): string {
      return currentLang.pages.help;
    },
    contact: function (): string {
      return currentLang.pages.contact;
    },
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
