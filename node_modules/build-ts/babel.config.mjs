import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

/** @type {import('@babel/core').TransformOptions} */
const config = {
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/proposal-numeric-separator',
    '@babel/plugin-syntax-import-assertions',
  ],
  env: {
    production: {
      plugins: [
        [
          'transform-remove-console',
          {
            exclude: ['error', 'info', 'warn'],
          },
        ],
      ],
    },
    test: {
      plugins: [
        [
          'transform-remove-console',
          {
            exclude: ['error', 'info', 'warn', 'debug'],
          },
        ],
      ],
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'auto',
          },
        ],
      ],
    },
  },
};

if (process.env.BUILD_TS_COREJS) {
  const rootPath = url.fileURLToPath(path.dirname(import.meta.url));
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
  const [major, minor] = packageJson.dependencies['core-js'].split('.');

  if (process.env.BUILD_TS_TARGET_CATEGORY === 'app') {
    /** @type {import('@babel/core').PluginItem} */
    const presetEnvConfig = config.presets[0][1];
    presetEnvConfig.useBuiltIns = 'usage';
    presetEnvConfig.corejs = `${major}.${minor}`;
  } else if (process.env.BUILD_TS_TARGET_CATEGORY === 'lib') {
    config.plugins.push(['polyfill-corejs3', { method: 'usage-pure', version: `${major}.${minor}` }]);
  }
}

if (process.env.BUILD_TS_TARGET_DETAIL === 'lib-react') {
  config.presets.push([
    '@babel/preset-react',
    {
      runtime: 'automatic',
    },
  ]);

  /** @type {import('@babel/core').PluginItem} */
  const presetEnvConfig = config.presets[0][1];
  presetEnvConfig.targets = { esmodules: true };
  presetEnvConfig.modules = false;
}

if (process.env.BUILD_TS_VERBOSE) {
  console.info('Babel config:', JSON.stringify(config, undefined, 2));
}

export default config;
