import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';

abstract class BaseType {}

class FunctionType extends BaseType {
  constructor(public params: string[]) {
    super();
  }
}

class ObjectType extends BaseType {
  constructor(public map: Map<string, BaseType>) {
    super();
  }
}

class TypeObjectGenerator {
  static run(langFilepath: string): BaseType {
    const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
    return TypeObjectGenerator.jsonObjToTypeObj(jsonObj);
  }

  private static jsonObjToTypeObj(jsonObj: unknown): BaseType {
    if (isString(jsonObj)) {
      const variableRegex = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
      const params: string[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = variableRegex.exec(jsonObj))) {
        if (match === null) break;
        if (!params.includes(match[1])) params.push(match[1]);
      }
      return new FunctionType(params);
    } else if (isObject(jsonObj)) {
      const map = new Map<string, BaseType>();
      for (const [key, value] of Object.entries(jsonObj)) {
        const valueTypeObj = TypeObjectGenerator.jsonObjToTypeObj(value);
        map.set(key, valueTypeObj);
      }
      return new ObjectType(map);
    }
    throw new Error('Error: JSONObject is neigher string nor object');
  }
}

class TypeObjectValidator {
  static run(defaultTypeObj: BaseType, typeObj: BaseType): void {
    if (TypeObjectValidator.equals(defaultTypeObj, typeObj)) return;
    throw new Error('Error: validation failed');
  }

  private static equals(ourTypeObj: BaseType, theirTypeObj: BaseType): boolean {
    if (ourTypeObj instanceof FunctionType && theirTypeObj instanceof FunctionType) {
      if (ourTypeObj.params.length !== theirTypeObj.params.length) return false;
      const sortedOurParams = ourTypeObj.params.slice().sort();
      const sortedTheirParams = theirTypeObj.params.slice().sort();
      for (let i = 0; i < ourTypeObj.params.length; i++) {
        if (sortedOurParams[i] !== sortedTheirParams[i]) return false;
      }
      return true;
    } else if (ourTypeObj instanceof ObjectType && theirTypeObj instanceof ObjectType) {
      if (ourTypeObj.map.size !== theirTypeObj.map.size) return false;
      for (const [key, value] of ourTypeObj.map) {
        const child = theirTypeObj.map.get(key);
        if (child === undefined || !TypeObjectValidator.equals(value, child)) return false;
      }
      return true;
    }
    return false;
  }
}

class CodeGenerator {
  static run(langFilepaths: string[], typeObj: BaseType, defaultLang: string): string {
    const langs = langFilepaths.map((langFilepath) => path.parse(langFilepath).name);
    if (!langs.includes(defaultLang)) {
      throw new Error('Error: cannot find default-lang file');
    }

    const varCurrentLang = 'currentLang';
    const varI18n = 'i18n';

    let code = '';

    for (const langFilepath of langFilepaths) {
      const lang = path.parse(langFilepath).name;
      const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
      const langCode = CodeGenerator.jsonObjToCode(jsonObj);
      code += `const ${lang} = ${langCode};\n`;
    }

    code += `let ${varCurrentLang} = ${defaultLang};\n`;

    const i18nCode = CodeGenerator.typeObjToCode(typeObj, varCurrentLang);
    code += `export const ${varI18n} = ${i18nCode};\n`;

    const currentLangChangerCode = CodeGenerator.currentLangChangerCode(langs, varCurrentLang);
    code += `export ${currentLangChangerCode}\n`;

    return code;
  }

  private static jsonObjToCode(jsonObj: unknown): string {
    if (isString(jsonObj)) {
      return `"${jsonObj}"`;
    } else if (isObject(jsonObj)) {
      let members = '';
      for (const [key, value] of Object.entries(jsonObj)) {
        const valueCode = CodeGenerator.jsonObjToCode(value);
        members += `${key}: ${valueCode}, `;
      }
      return `{ ${members} }`;
    }
    throw new Error('Error: JSONObject is neigher string nor object');
  }

  private static typeObjToCode(typeObj: BaseType, varName: string): string {
    if (typeObj instanceof FunctionType) {
      let delimiter = '';
      let declaration = 'function (';
      for (const param of typeObj.params) {
        declaration += `${delimiter}${param}: string`;
        delimiter = ', ';
      }
      declaration += '): string';
      let expr = varName;
      for (const param of typeObj.params) {
        expr += `.replace(/\\$\\{${param}\\}/g, ${param})`;
      }
      return `${declaration} { return ${expr}; }`;
    } else if (typeObj instanceof ObjectType) {
      let members = '';
      for (const [key, value] of typeObj.map) {
        const valueCode = CodeGenerator.typeObjToCode(value, `${varName}.${key}`);
        members += `${key}: ${valueCode}, `;
      }
      return `{ ${members} }`;
    }
    throw new Error('Error: unexpected typeObj');
  }

  private static currentLangChangerCode(langs: string[], varCurrentLang: string): string {
    const varLang = 'lang';
    let delimiter = '';
    let declaration = `function changeCurrentLang(${varLang}: `;
    for (const lang of langs) {
      declaration += `${delimiter}"${lang}"`;
      delimiter = ' | ';
    }
    declaration += '): void';
    let statement = `switch (${varLang}) { `;
    for (const lang of langs) {
      statement += `case "${lang}": ${varCurrentLang} = ${lang}; break; `;
    }
    statement += ' }';

    return `${declaration} { ${statement} }`;
  }
}

function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

function isObject(obj: unknown): obj is Record<string, any> {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

function main(): void {
  const { indir, outfile, defaultLang } = yargs.options({
    indir: { type: 'string', alias: 'i' },
    outfile: { type: 'string', alias: 'o' },
    defaultLang: { type: 'string', alias: 'd' },
  }).argv;

  if (!indir || !outfile || !defaultLang) {
    throw new Error('Usage: yarn start -i [dirpath] -o [filepath] -d [lang]');
  }

  const langFilepaths = fs
    .readdirSync(indir)
    .filter((fileName) => /^.*\.json$/.test(fileName))
    .map((langFileName) => path.join(indir, langFileName));

  const defaultLangFilepath = path.join(indir, `${defaultLang}.json`);

  if (!langFilepaths.includes(defaultLangFilepath)) {
    throw new Error('Error: cannot find default-lang file');
  }

  const defaultTypeObj = TypeObjectGenerator.run(defaultLangFilepath);
  for (const langFilepath of langFilepaths) {
    if (langFilepath == defaultTypeObj) continue;
    const typeObj = TypeObjectGenerator.run(langFilepath);
    TypeObjectValidator.run(defaultTypeObj, typeObj);
  }

  const code = CodeGenerator.run(langFilepaths, defaultTypeObj, defaultLang);
  fs.writeFileSync(outfile, code, { encoding: 'utf-8' });
}

main();
