# gen-i18n-ts

[![npm version](https://img.shields.io/npm/v/gen-i18n-ts.svg)](https://www.npmjs.com/package/gen-i18n-ts)
[![license](https://img.shields.io/npm/l/gen-i18n-ts.svg)](https://www.npmjs.com/package/gen-i18n-ts)
[![Test](https://github.com/WillBooster/gen-i18n-ts/actions/workflows/test.yml/badge.svg)](https://github.com/WillBooster/gen-i18n-ts/actions/workflows/test.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![wbfy](https://img.shields.io/badge/wbfy-21.0.2-1e90ff.svg)](https://github.com/WillBooster/shared/tree/main/packages/wbfy)

A CLI tool to generate a strictly-typed i18n object literal written in TypeScript from JSON files.

## Installation

```
npm install -D gen-i18n-ts
```

or

```
yarn add -d gen-i18n-ts
```

## Why gen-i18n-ts

The leading feature of gen-i18n-ts is to provide a strictly-typed internationalization object literal written in TypeScript.
The generated object literal is friendly with auto-completion in your text editor.

## How it works

1. run gen-i18n-ts command.

```
gen-i18n-ts -i inputDir -o outputFile -d defaultLang
```

See [Usage of gen-i18n-ts command](Usage-of-gen-i18n-ts-command) section for more details.

2. import the generated file to your TypeScript modules.

**Default behavior (non-global mode):**

```ts
import { i18n } from 'path/to/generated/i18n';

// Get i18n object for specific language
const enI18n = i18n('en');
const jaI18n = i18n('ja');

// Functions without parameters
enI18n.okButtonName();
// => "Done"

// Functions with parameters use named arguments
enI18n.welcome({ userName: 'John' });
// => "Hi, John"

jaI18n.welcome({ userName: '太郎' });
// => "こんにちは、太郎さん"
```

`i18n(language)` returns the same object for the same language, so it is safe to use as a dependency of React hooks.
The generated file also exports `isSupportedLanguage(language)` and `matchSupportedLanguage(language)`; the latter falls back to a supported language that shares the primary subtag (e.g., `en-GB` → `en-US`).

**Global mode (with `--global` flag):**

```ts
import { changeLanguageByCode, i18n } from 'path/to/generated/i18n';

// Functions without parameters
i18n.okButtonName();
// => "Done"

// Functions with parameters use named arguments
i18n.welcome({ userName: 'John' });
// => "Hi, John"

i18n.pages.user({ userName: 'John' });
// => "John's page"

// Change language
changeLanguageByCode('ja');

// Now messages are in Japanese
i18n.welcome({ userName: '太郎' });
// => "こんにちは、太郎さん"
```

## Usage of gen-i18n-ts command

gen-i18n-ts takes three required arguments: `inputDir`, `outputFile` and `defaultLang`.

### Command Line Options

- `-i, --inputDir`: A path to input directory (required)
- `-o, --outfile`: A path to output file (required)
- `-d, --defaultLang`: A name of a default language (required)
- `-w, --watch`: Enable watch mode (optional)
- `-g, --global`: Generate with global state (currentLanguage variable) (optional, default: false)
- `--next`: Generate Next.js client helpers (optional, defaults to auto-detecting Next.js from `package.json`)

### Basic Usage

**Default (non-global mode):**

```bash
gen-i18n-ts -i i18n-json -o i18n.ts -d en
```

**Global mode:**

```bash
gen-i18n-ts -i i18n-json -o i18n.ts -d en --global
```

**Next.js helpers:**

When the target package has `next` in `package.json`, gen-i18n-ts also generates Next.js helper files next to the main output.
For example, `-o src/__generated__/i18n.ts` generates `src/__generated__/i18n.next.tsx` and `src/__generated__/i18n.next.server.ts`.
You can force this behavior with `--next` or disable it with `--no-next`.
Next.js helpers require non-global mode because global mode shares one mutable i18n instance across all server-side users.

```tsx
import { LocaleProvider, useI18n } from '@/__generated__/i18n.next';

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

export function SaveButton() {
  const t = useI18n();
  return <button type="button">{t.okButtonName()}</button>;
}
```

The helper reads the `[locale]` route parameter through `next/navigation`, falls back to the default language, and exposes `useLocaleValue`, `useSetLocale`, and `useI18n`.
The server helper reads the `preferred-locale` cookie first, then falls back to the `Accept-Language` header in descending order of quality.
Use `await getI18n()` in server components or actions when locale route params are not already available.

```ts
import { getI18n } from '@/__generated__/i18n.next.server';

export async function Page() {
  const t = await getI18n();
  return <h1>{t.pages.home.title()}</h1>;
}
```

The following description takes [readme-sample](./samples/readme-sample) for example.

### Input (`inputDir`)

`inputDir` is the path to the directory which contains JSON or YAML files for internationalization.
The input directory should be like

```
i18n-json/
  en.json
  ja.json
  ...
```

- the input directory is expected to contain only JSON or YAML (`.yaml`, `.yml`) files. Sub-directories and other files are ignored.
- a file should be named as `langage.json` (or `langage.yaml` / `langage.yml`). `langage` does NOT HAVE TO be a ISO 639 code

A JSON file in the directory (`en.json`, `ja.json` in this case) is expected to contain messages in each language.
It should be like

**en.json**

```json
{
  "okButtonName": "Done",
  "welcome": "Hi, ${userName}",
  "pages": {
    "user": "${userName}'s page",
    "help": "Help",
    "contact": "Contact"
  }
}
```

**ja.json**

```json
{
  "okButtonName": "完了",
  "welcome": "こんにちは、${userName}さん",
  "pages": {
    "user": "${userName}さんのページ",
    "help": "ヘルプ",
    "contact": "お問い合わせ"
  }
}
```

- JSONs in files are expected to have the "same" structure. If JSONs have different structures, that of the default language have priority (see also `default language` section)
  - if a key is in the default language but not in a non-default language, the key-value pair in the default one will be added to the non-default one (see also [lacked-key-sample](./samples/lacked-key-sample))
  - if a key is in a non-default language but not in the default language, the key-value pair in the non-default one will be ignored (see also [excess-key-sample](./samples/excess-key-sample))
- `${variableName}` represents a parameter name of the function in the output (see also [Output](<Output-(`outputFile`)>) section)
  - If the same function takes different parameters in different languages, they are merged. The function in the output takes all of the parameters

**Detail**  
BNF of a JSON String for Internationalization

```
object   ::= { key: object } | { key: value }
key      ::= string
value    ::= string | value variable value
variable ::= ${ [a-zA-Z_][a-zA-Z0-9_]* }
```

Definition of "Same" Structure

```
If set of keys in two objects has the same, they are considered to have same structure.
The order of the keys are not cared.
```

### Output (`outputFile`)

`outputFile` is the path to the TypeScript file for internationalization. The generated exports depend on the mode:

Both modes compile each language's messages into functions once, when the module is loaded:

```ts
type Messages = {
  okButtonName: () => string;
  welcome: (params: { userName: unknown }) => string;
  pages: { user: (params: { userName: unknown }) => string; help: () => string; contact: () => string };
};

const languages: Record<SupportedLanguage, Messages> = {
  en: {
    okButtonName: () => 'Done',
    welcome: (params) => 'Hi, ' + String(params.userName),
    pages: { user: (params) => String(params.userName) + "'s page", help: () => 'Help', contact: () => 'Contact' },
  },
  ja: { ... },
};
```

#### Default (Non-Global) Mode

Exports an `i18n` function that returns the messages of a language:

```ts
export const i18n = function (language: string): Messages {
  if (!isSupportedLanguage(language)) throw new Error(`Language "${language}" not found`);
  return languages[language];
};
```

#### Global Mode (with `--global` flag)

Exports an `i18n` object that delegates to the current language, and `changeLanguageByCode` to switch it:

```ts
let currentLanguage: SupportedLanguage = 'en';
export const i18n: Messages = {
  okButtonName: () => languages[currentLanguage]['okButtonName'](),
  welcome: (params) => languages[currentLanguage]['welcome'](params),
  pages: { ... },
};

export function changeLanguageByCode(lang: string): boolean {
  if (!isSupportedLanguage(lang)) return false;
  currentLanguage = lang;
  return true;
}
```

#### Notes

- Even if a string in the input has no `${variableName}`, the output will be a zero-argument FUNCTION, NOT a STRING
- Functions with parameters use named arguments (e.g., `{ userName: 'value' }`) instead of positional arguments
- In global mode, `changeLanguageByCode` returns `true` if `lang` is valid and `false` otherwise

### Default language (`defaultLang`)

`defaultLang` is a string which represents the language used by default.

- it must be one of the names of the input files without their extension (e.g., `en` for `en.json` or `en.yaml`) in the input directory (if not, gen-i18n-ts throws an error).
- it is used to define the priority of the input files
- it is used as a initial value of the variable `currentLanguage` in global mode.
