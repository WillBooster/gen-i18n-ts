import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';

enum TypeEnum {
  Function,
  Object,
  Error,
}

class TypeTree {
  type: TypeEnum;

  // for function: (string, string, ...) => string
  // undefined if this.type !== TypeEnum.Function
  params?: string[];

  // for object (not Array)
  // undefined if this.type !== TypeEnum.Object
  map?: Map<string, TypeTree>;

  private constructor(type: TypeEnum) {
    this.type = type;
  }

  static newFunctionType(params: string[]): TypeTree {
    const instance = new TypeTree(TypeEnum.Function);
    instance.params = params;
    return instance;
  }

  static newObjectType(map: Map<string, TypeTree>): TypeTree {
    const instance = new TypeTree(TypeEnum.Object);
    instance.map = map;
    return instance;
  }

  static newErrorType(): TypeTree {
    return new TypeTree(TypeEnum.Error);
  }

  equals(typeTree: TypeTree): boolean {
    if (this.type !== typeTree.type) return false;

    switch (this.type) {
      case TypeEnum.Function: {
        if (this.params === undefined || typeTree.params === undefined) {
          console.error('Error: typeTree.params is undefined');
          return false;
        }
        if (this.params.length !== typeTree.params.length) return false;
        const sortedOurParams = this.params.slice().sort();
        const sortedTheirParams = typeTree.params.slice().sort();
        for (let i = 0; i < this.params.length; i++) {
          if (sortedOurParams[i] !== sortedTheirParams[i]) return false;
        }
        return true;
      }
      case TypeEnum.Object: {
        if (this.map === undefined || typeTree.map === undefined) {
          console.error('Error: typeTree.map is undefined');
          return false;
        }
        if (this.map.size !== typeTree.map.size) return false;
        for (const [key, value] of this.map) {
          const child = typeTree.map.get(key);
          if (child === undefined || !value.equals(child)) return false;
        }
        return true;
      }
      case TypeEnum.Error:
        return true;
    }
  }
}

function convert(langFilepath: string): TypeTree {
  const jsonObjToTypeTree = (jsonObj: any): TypeTree => {
    if (typeof jsonObj === 'string') {
      const variables = jsonObj.match(/\$\{[a-zA-Z_][a-zA-Z0-9_]*\}/g);
      if (variables === null) return TypeTree.newFunctionType([]);
      const params = variables
        .filter((value, index) => variables.indexOf(value) === index)
        .map((value) => value.slice(2, value.length - 1));
      return TypeTree.newFunctionType(params);
    } else if (typeof jsonObj === 'object' && !Array.isArray(jsonObj)) {
      const map = new Map<string, TypeTree>();
      for (const [key, value] of Object.entries(jsonObj)) {
        const valueTreeType = jsonObjToTypeTree(value);
        if (valueTreeType.type == TypeEnum.Error) return TypeTree.newErrorType();
        map.set(key, valueTreeType);
      }
      return TypeTree.newObjectType(map);
    }
    console.error('Error: JSONObject is neigher string nor object');
    return TypeTree.newErrorType();
  };
  const jsonObj = JSON.parse(fs.readFileSync(langFilepath, { encoding: 'utf-8', flag: 'r' }));
  return jsonObjToTypeTree(jsonObj);
}

function validate(langFilepath: string, defalutTypeTree: TypeTree): boolean {
  if (defalutTypeTree.type == TypeEnum.Error) {
    console.error('Error: typeTree has some errors');
    return false;
  }
  const typeTree = convert(langFilepath);
  if (typeTree.type == TypeEnum.Error) {
    console.error('Error: typeTree has some errors');
    return false;
  }

  if (!defalutTypeTree.equals(typeTree)) {
    console.error('Error: validation failed');
    return false;
  }

  return true;
}

function gen(langFilepaths: string[], typeTree: TypeTree, defaultLang: string): string {
  if (typeTree.type == TypeEnum.Error) {
    console.error('Error: typeTree has some errors');
    return '';
  }
  const langs = langFilepaths.map((langFilepath) => path.parse(langFilepath).name);
  if (!langs.includes(defaultLang)) {
    console.error('Error: cannot find default-lang file');
    return '';
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
        if (valueCodeString == '') return '';
        members += `${key}: ${valueCodeString}, `;
      }
      return `{ ${members} }`;
    }
    console.error('Error: JSONObject is neigher string nor object');
    return '';
  };

  for (const langFilepath of langFilepaths) {
    const fileText = fs.readFileSync(langFilepath, { encoding: 'utf-8', flag: 'r' });
    const lang = path.parse(langFilepath).name;
    const langCodeString = jsonObjToCodeString(JSON.parse(fileText));
    if (langCodeString == '') return '';
    codeString += `const ${lang} = ${langCodeString};\n`;
  }

  codeString += `let ${varCurrentLang} = ${defaultLang};\n`;

  const typeTreeToCodeString = (typeTree: TypeTree, path: string): string => {
    switch (typeTree.type) {
      case TypeEnum.Function: {
        if (typeTree.params === undefined) {
          console.error('Error: typeTree.params is undefined');
          return '';
        }

        let declaration = 'function (';
        for (let i = 0; i < typeTree.params.length; i++) {
          declaration += `${typeTree.params[i]}: string`;
          if (i !== typeTree.params.length - 1) declaration += ', ';
        }
        declaration += '): string';

        let expr = path;
        for (const param of typeTree.params) {
          expr += `.replace("\${${param}}", ${param})`;
        }
        return `${declaration} { return ${expr}; }`;
      }
      case TypeEnum.Object: {
        if (typeTree.map === undefined) {
          console.error('Error: typeTree.map is undefined');
          return '';
        }

        let members = '';
        for (const [key, value] of typeTree.map) {
          const valueCodeString = typeTreeToCodeString(value, `${path}.${key}`);
          if (valueCodeString == '') return '';
          members += `${key}: ${valueCodeString}, `;
        }
        return `{ ${members} }`;
      }
      case TypeEnum.Error:
        console.error('Error: typeTree has some errors');
        return '';
    }
  };

  const l10nCodeString = typeTreeToCodeString(typeTree, varCurrentLang);
  if (l10nCodeString == '') return '';
  codeString += `export const i18n = ${l10nCodeString};\n`;

  const currentLangChangerCodeString = (): string => {
    const varLang = 'lang';

    let declaration = '';
    declaration += `function changeCurrentLang(${varLang}: `;
    for (let i = 0; i < langs.length; i++) {
      declaration += `"${langs[i]}"`;
      if (i !== langs.length - 1) declaration += ' | ';
    }
    declaration += '): void';

    let statement = '';
    statement += `switch (${varLang}) { `;
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
    defaultLang: { type: 'string', alias: 'default' },
  }).argv;
  if (indir === undefined || outfile === undefined || defaultLang === undefined) {
    console.error('Usage: yarn start --i [dirpath] --o [filepath] --default [lang]');
    return;
  }

  const langFilepaths = fs.readdirSync(indir).map((filename) => `${indir}/${filename}`);

  const typeTree = convert(`${indir}/${defaultLang}.json`);
  for (const langFilepath of langFilepaths) {
    if (!validate(langFilepath, typeTree)) return;
  }

  const codeString = gen(langFilepaths, typeTree, defaultLang);
  if (codeString == '') return;
  fs.writeFileSync(outfile, codeString, { encoding: 'utf-8', flag: 'w' });
}

main();
