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

function convert(langFilepath: string): BaseType {
  const jsonObjToType = (jsonObj: any): BaseType => {
    if (typeof jsonObj === 'string') {
      const variableRegex = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
      const params: string[] = [];
      while (true) {
        const match = variableRegex.exec(jsonObj);
        if (match === null) break;
        if (!params.includes(match[1])) params.push(match[1]);
      }
      return new FunctionType(params);
    } else if (typeof jsonObj === 'object' && !Array.isArray(jsonObj)) {
      const map = new Map<string, BaseType>();
      for (const [key, value] of Object.entries(jsonObj)) {
        const valueTreeType = jsonObjToType(value);
        map.set(key, valueTreeType);
      }
      return new ObjectType(map);
    }
    throw new Error('Error: JSONObject is neigher string nor object');
  };

  const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8', flag: 'r' }));
  return jsonObjToType(jsonObj);
}

function validate(langFilepath: string, type: BaseType): void {
  const equals = (ourType: BaseType, theirType: BaseType): boolean => {
    if (ourType instanceof FunctionType && theirType instanceof FunctionType) {
      if (ourType.params.length !== theirType.params.length) return false;
      const sortedOurParams = ourType.params.slice().sort();
      const sortedTheirParams = theirType.params.slice().sort();
      for (let i = 0; i < ourType.params.length; i++) {
        if (sortedOurParams[i] !== sortedTheirParams[i]) return false;
      }
      return true;
    } else if (ourType instanceof ObjectType && theirType instanceof ObjectType) {
      if (ourType.map.size !== theirType.map.size) return false;
      for (const [key, value] of ourType.map) {
        const child = theirType.map.get(key);
        if (child === undefined || !equals(value, child)) return false;
      }
      return true;
    }
    return false;
  };

  if (!equals(type, convert(langFilepath))) throw new Error('Error: validation failed');
}

function gen(langFilepaths: string[], type: BaseType, defaultLang: string): string {
  const langs = langFilepaths.map((langFilepath) => path.parse(langFilepath).name);
  if (!langs.includes(defaultLang)) {
    throw new Error('Error: cannot find default-lang file');
  }

  const varCurrentLang = 'currentLang';
  let codeString = '';

  const jsonObjToCodeString = (jsonObj: any): string => {
    if (typeof jsonObj === 'string') {
      return `"${jsonObj}"`;
    } else if (typeof jsonObj === 'object' && !Array.isArray(jsonObj)) {
      let members = '';
      for (const [key, value] of Object.entries(jsonObj)) {
        const valueCodeString = jsonObjToCodeString(value);
        members += `${key}: ${valueCodeString}, `;
      }
      return `{ ${members} }`;
    }
    throw new Error('Error: JSONObject is neigher string nor object');
  };

  for (const langFilepath of langFilepaths) {
    const fileText = fs.readFileSync(langFilepath, { encoding: 'utf-8', flag: 'r' });
    const lang = path.parse(langFilepath).name;
    const langCodeString = jsonObjToCodeString(JSON.parse(fileText));
    codeString += `const ${lang} = ${langCodeString};\n`;
  }

  codeString += `let ${varCurrentLang} = ${defaultLang};\n`;

  const typeToCodeString = (type: BaseType, path: string): string => {
    if (type instanceof FunctionType) {
      let declaration = 'function (';
      for (let i = 0; i < type.params.length; i++) {
        declaration += `${type.params[i]}: string`;
        if (i !== type.params.length - 1) declaration += ', ';
      }
      declaration += '): string';
      let expr = path;
      for (const param of type.params) {
        expr += `.replace("\${${param}}", ${param})`;
      }
      return `${declaration} { return ${expr}; }`;
    } else if (type instanceof ObjectType) {
      let members = '';
      for (const [key, value] of type.map) {
        const valueCodeString = typeToCodeString(value, `${path}.${key}`);
        members += `${key}: ${valueCodeString}, `;
      }
      return `{ ${members} }`;
    }
    throw new Error('Error: unexpected type');
  };

  const l10nCodeString = typeToCodeString(type, varCurrentLang);
  codeString += `export const i18n = ${l10nCodeString};\n`;

  const currentLangChangerCodeString = (): string => {
    const varLang = 'lang';
    let declaration = `function changeCurrentLang(${varLang}: `;
    for (let i = 0; i < langs.length; i++) {
      declaration += `"${langs[i]}"`;
      if (i !== langs.length - 1) declaration += ' | ';
    }
    declaration += '): void';
    let statement = `switch (${varLang}) { `;
    for (const lang of langs) {
      statement += `case "${lang}": ${varCurrentLang} = ${lang}; break; `;
    }
    statement += ' }';

    return `${declaration} { ${statement} }`;
  };

  codeString += `export ${currentLangChangerCodeString()}\n`;

  return codeString;
}

function main(): void {
  const { indir, outfile, defaultLang } = yargs.options({
    indir: { type: 'string', alias: 'i' },
    outfile: { type: 'string', alias: 'o' },
    defaultLang: { type: 'string', alias: 'd' },
  }).argv;
  if (!indir || !outfile || !defaultLang) {
    throw new Error('Usage: yarn start --i [dirpath] --o [filepath] --d [lang]');
  }

  const langFilepaths = fs.readdirSync(indir).map((filename) => `${indir}/${filename}`);

  const type = convert(`${indir}/${defaultLang}.json`);
  for (const langFilepath of langFilepaths) {
    validate(langFilepath, type);
  }

  const codeString = gen(langFilepaths, type, defaultLang);
  fs.writeFileSync(outfile, codeString, { encoding: 'utf-8', flag: 'w' });
}

main();
