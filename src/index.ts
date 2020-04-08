import * as fs from 'fs';
import * as path from 'path';

enum TypeEnum {
  String,
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

  static newStringType(): TypeTree {
    return new TypeTree(TypeEnum.String);
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
      case TypeEnum.String:
        return true;
      case TypeEnum.Function: {
        if (this.params === undefined || typeTree.params === undefined) return false;
        if (this.params.length !== typeTree.params.length) return false;
        const sortedOurParams = this.params.slice().sort();
        const sortedTheirParams = typeTree.params.slice().sort();
        for (let i = 0; i < this.params.length; i++) {
          if (sortedOurParams[i] !== sortedTheirParams[i]) return false;
        }
        return true;
      }
      case TypeEnum.Object: {
        if (this.map === undefined || typeTree.map === undefined) return false;
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
      const variables = jsonObj.match(/\$\{[a-zA-Z_][a-zA-Z0-9_]*\}/);
      if (variables === null) return TypeTree.newStringType();
      const params = variables
        .filter((value, index) => variables.indexOf(value) === index)
        .map((value) => value.slice(2, value.length - 1));
      return TypeTree.newFunctionType(params);
    } else if (typeof jsonObj === 'object' && !Array.isArray(jsonObj)) {
      const map = new Map<string, TypeTree>();
      for (const [key, value] of Object.entries(jsonObj)) {
        const treeType = jsonObjToTypeTree(value);
        if (treeType.type == TypeEnum.Error) return TypeTree.newErrorType();
        map.set(key, treeType);
      }
      return TypeTree.newObjectType(map);
    }
    console.error('Error: failed to convert json to typeTree');
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

function gen(langFilepaths: string[], typeTree: TypeTree, defaultLang: string, codeFilePath: string): void {
  if (typeTree.type == TypeEnum.Error) {
    console.error('Error: cannot generate code from typeTree containing some errors');
    return;
  }
  const langs = langFilepaths.map((langFilepath) => path.parse(langFilepath).name);
  if (!langs.includes(defaultLang)) {
    console.error('Error: cannot find default-lang file');
    return;
  }

  const valCurrentLang = 'currentLang';
  let codeString = '';

  const jsonToCodeString = (jsonObj: any): string => {
    if (typeof jsonObj === 'string') {
      return `'${jsonObj}'`;
    } else if (typeof jsonObj === 'object' && !Array.isArray(jsonObj)) {
      let members = '';
      for (const [key, value] of Object.entries(jsonObj)) {
        members += `${key}: ${jsonToCodeString(value)}, `;
      }
      return `{ ${members} }`;
    }
    console.error('Error: failed to generate code');
    return '';
  };

  for (const langFilepath of langFilepaths) {
    const lang = path.parse(langFilepath).name;
    const fileText = fs.readFileSync(langFilepath, { encoding: 'utf-8', flag: 'r' });
    const jsonObj = JSON.parse(fileText);
    codeString += `const ${lang} = ${jsonToCodeString(jsonObj)}\n`;
  }

  codeString += `let ${valCurrentLang} = ${defaultLang}\n`;

  const typeTreeToCodeString = (typeTree: TypeTree, path: string): string => {
    switch (typeTree.type) {
      case TypeEnum.String:
        return path;
      case TypeEnum.Function: {
        if (typeTree.params === undefined) return '';

        let declaration = 'function (';
        for (let i = 0; i < typeTree.params.length - 1; i++) {
          declaration += `${typeTree.params[i]}: string, `;
        }
        declaration += `${typeTree.params[typeTree.params.length - 1]}: string`;
        declaration += '): string';

        let expr = path;
        for (const param of typeTree.params) {
          expr += `.replace('\${${param}}', ${param})`;
        }
        return `${declaration} { return ${expr}; }`;
      }
      case TypeEnum.Object: {
        if (typeTree.map === undefined) return '';

        let members = '';
        for (const [key, value] of typeTree.map) {
          members += `${key}: ${typeTreeToCodeString(value, `${path}.${key}`)}, `;
        }
        return `{ ${members} }`;
      }

      case TypeEnum.Error:
      default:
        return '';
    }
  };

  codeString += `export const l10n = ${typeTreeToCodeString(typeTree, valCurrentLang)}\n`;
  fs.writeFileSync(codeFilePath, codeString, { encoding: 'utf-8', flag: 'w' });
}

function main(): void {
  const langFilepaths = fs.readdirSync('test/in').map((filename) => `test/in/${filename}`);
  const codeFilePath = 'test/out/out.ts';
  const defaultLang = 'ja';

  const typeTree = convert(`test/in/${defaultLang}.json`);
  for (const langFilepath of langFilepaths) {
    if (!validate(langFilepath, typeTree)) return;
  }

  gen(langFilepaths, typeTree, defaultLang, codeFilePath);
}

main();
