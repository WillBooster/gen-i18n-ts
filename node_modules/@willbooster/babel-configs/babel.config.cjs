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
  plugins: ['@babel/proposal-class-properties', '@babel/proposal-numeric-separator'],
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

module.exports = config;
