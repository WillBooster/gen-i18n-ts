# build-ts

[![Test](https://github.com/WillBooster/build-ts/actions/workflows/test.yml/badge.svg)](https://github.com/WillBooster/build-ts/actions/workflows/test.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

An opinionated tool for building a Node.js app and library written in TypeScript.

## Features

- Builder / Bundler (`rollup` wrapper)
  - [x] `build-ts app`
    - [x] Bundle TypeScript code as Node.js application
  - [x] `build-ts functions`
    - [x] Bundle TypeScript code as GCP/Firebase Functions
    - [x] Generate optimized `package.json` for Functions
  - [x] `build-ts lib`
    - [x] Bundle TypeScript code as Node.js / Pure JavaScript / React Library
  - [x] Remove `console.log` automatically
- Executor (`ts-node` wrapper)
  - [x] `build-ts run <TypeScript file>`
    - [x] Run TypeScript code as Node.js script

## Node.js Application

`npx build-ts app [project path]`, e.g.,

```sh
npx build-ts app test-fixtures/app-node
# or
cd test-fixtures/app-node && npx build-ts app
```

## Firebase Functions

`npx build-ts functions [project path]`, e.g.,

```sh
npx build-ts app test-fixtures/functions
# or
cd test-fixtures/functions && npx build-ts app
```

## Node.js / Browser Library

`npx build-ts lib [project path]`, e.g.,

```sh
npx build-ts lib test-fixtures/lib
# or
cd test-fixtures/lib && npx build-ts lib
```

## React Library

`npx build-ts lib [project path]`, e.g.,

```sh
npx build-ts lib test-fixtures/lib-react
# or
cd test-fixtures/lib-react && npx build-ts lib
```

## Run TypeScript code with arguments

```sh
echo "console.log(process.argv)" > test.ts
npx build-ts run test.ts -- --foo bar
```

The output is like this:

```
[ '/path/to/node',
  '/path/to/build-ts/dist/bin/run.js',
  '--foo',
  'bar' ]
```
