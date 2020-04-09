module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      babelConfig: {
        presets: ['power-assert'],
      },
    },
  },
};
