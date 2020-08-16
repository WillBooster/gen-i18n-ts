import { langToFilename } from './utils';

export const ErrorMessages = {
  usage(): string {
    return 'Usage: yarn start -i [dirpath] -o [filepath] -d [lang]';
  },
  noDefaultLangFile(): string {
    return 'cannot find default-lang file.';
  },
  langFileNotObject(lang: string): string {
    return `${langToFilename(lang)}: JSON is not Object.`;
  },
  varShouldString(lang: string, varName: string): string {
    return `${langToFilename(lang)}: '${varName}' is expected to be string.`;
  },
  varShouldObject(lang: string, varName: string): string {
    return `${langToFilename(lang)}: '${varName}' is expected to be Object.`;
  },
  varShouldStringOrObject(lang: string, varName: string): string {
    return `${langToFilename(lang)}: '${varName}' is neigher string nor Object.`;
  },
  unreachable(): string {
    return 'UNREACHABLE: this may be a bug! please let us know.';
  },
};

export const InfoMessages = {
  varIgnored(lang: string, varName: string): string {
    const langFilename = langToFilename(lang);
    return `${langFilename}: '${varName}' is ignored. Not in default-lang file but in ${langFilename}.`;
  },
  varFilled(lang: string, varName: string): string {
    const langFilename = langToFilename(lang);
    return `${langFilename}: '${varName}' is filled with default value. Not in ${langFilename} but in default-lang file.`;
  },
  functionParamAdded(lang: string, functionName: string, addedParam: string): string {
    const langFilename = langToFilename(lang);
    return (
      `${langFilename}: parameter '${addedParam}' is added to function '${functionName}'.` +
      ` Default '${functionName}' doesn't need '${addedParam}' but that in ${langFilename} needs it.`
    );
  },
};
