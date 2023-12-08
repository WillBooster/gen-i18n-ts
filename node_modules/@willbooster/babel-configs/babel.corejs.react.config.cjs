const config = require('./babel.corejs.config.cjs');
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

module.exports = config;
