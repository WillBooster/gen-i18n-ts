export const VARIABLE_REGEX = /\${([a-zA-Z_][a-zA-Z0-9_]*)}/g;

export const ErrorMessages = {
  usage(): string {
    return 'Usage: yarn start -i [dirpath] -o [filepath] -d [lang]';
  },
  duplicatedLangFile(fileName: string, anotherFileName: string): string {
    return ['The following files represent the same language:', fileName, anotherFileName].join('\n');
  },
  noDefaultLangFile(): string {
    return 'Cannot find the default language file.';
  },
  langFileNotObject(lang: string): string {
    return `${lang}: JSON is not Object.`;
  },
  varShouldString(lang: string, varName: string): string {
    return `${lang}: '${varName}' is expected to be string.`;
  },
  varShouldObject(lang: string, varName: string): string {
    return `${lang}: '${varName}' is expected to be Object.`;
  },
  varShouldStringOrObject(lang: string, varName: string): string {
    return `${lang}: '${varName}' is neither string nor Object.`;
  },
  unreachable(): string {
    return 'UNREACHABLE: this may be a bug! Please let us know.';
  },
};

export const InfoMessages = {
  analyzingLangFile(langFilePath: string): string {
    return `${langFilePath}: Analyzing...`;
  },
  varIgnored(langFilename: string, varName: string): string {
    return `${langFilename}: '${varName}' is ignored because it doesn't exist in the default language file.`;
  },
  varFilled(langFilename: string, varName: string): string {
    return `${langFilename}: '${varName}' is filled with a default value because it doesn't exist in ${langFilename}.`;
  },
  functionParamAdded(langFilename: string, functionName: string, addedParam: string): string {
    return (
      `${langFilename}: parameter '${addedParam}' is added to function '${functionName}'.` +
      ` Default '${functionName}' doesn't need '${addedParam}' but that in ${langFilename} needs it.`
    );
  },
};
