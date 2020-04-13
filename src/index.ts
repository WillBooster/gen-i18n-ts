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
  const jsonObjToTypeObj = (jsonObj: any): BaseType => {
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
        const valueTreeType = jsonObjToTypeObj(value);
        map.set(key, valueTreeType);
      }
      return new ObjectType(map);
    }
    throw new Error('Error: JSONObject is neigher string nor object');
  };

  const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8' }));
  return jsonObjToTypeObj(jsonObj);
}

function validate(langFilepath: string, typeObj: BaseType): void {
  const equals = (ourTypeObj: BaseType, theirTypeObj: BaseType): boolean => {
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
        if (child === undefined || !equals(value, child)) return false;
      }
      return true;
    }
    return false;
  };

  if (!equals(typeObj, convert(langFilepath))) throw new Error('Error: validation failed');
}

function gen(langFilepaths: string[], typeObj: BaseType, defaultLang: string): string {
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

  const typeObjToCodeString = (typeObj: BaseType, path: string): string => {
    if (typeObj instanceof FunctionType) {
      let declaration = 'function (';
      for (let i = 0; i < typeObj.params.length; i++) {
        declaration += `${typeObj.params[i]}: string`;
        if (i !== typeObj.params.length - 1) declaration += ', ';
      }
      declaration += '): string';
      let expr = path;
      for (const param of typeObj.params) {
        expr += `.replace(/\\$\\{${param}\\}/g, ${param})`;
      }
      return `${declaration} { return ${expr}; }`;
    } else if (typeObj instanceof ObjectType) {
      let members = '';
      for (const [key, value] of typeObj.map) {
        const valueCodeString = typeObjToCodeString(value, `${path}.${key}`);
        members += `${key}: ${valueCodeString}, `;
      }
      return `{ ${members} }`;
    }
    throw new Error('Error: unexpected typeObj');
  };

  const l10nCodeString = typeObjToCodeString(typeObj, varCurrentLang);
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

  const typeObj = convert(`${indir}/${defaultLang}.json`);
  for (const langFilepath of langFilepaths) {
    validate(langFilepath, typeObj);
  }

  const codeString = gen(langFilepaths, typeObj, defaultLang);
  fs.writeFileSync(outfile, codeString, { encoding: 'utf-8' });
}

main();
