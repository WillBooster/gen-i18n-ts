const en = { okButtonName: "Done", welcome: "Hi, ${userName}", pages: { user: "${userName}'s page", help: "Help", contact: "Contact",  },  };
const ja = { okButtonName: "完了", welcome: "こんにちは、${userName}さん", pages: { user: "${userName}のページ", help: "ヘルプ", contact: "お問い合わせ",  },  };
let currentLang = ja;
export const l10n = { okButtonName: currentLang.okButtonName, welcome: function (userName: string): string { return currentLang.welcome.replace("${userName}", userName); }, pages: { user: function (userName: string): string { return currentLang.pages.user.replace("${userName}", userName); }, help: currentLang.pages.help, contact: currentLang.pages.contact,  },  };
export function changeCurrentLang(lang: "en" | "ja"): void { switch (lang) { case "en": currentLang = en; break; case "ja": currentLang = ja; break;  } }
