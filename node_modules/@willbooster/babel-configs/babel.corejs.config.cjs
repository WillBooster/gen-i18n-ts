const config = require('./babel.config.cjs');

const packageJson = require('./package.json');
const [major, minor] = packageJson.devDependencies['core-js'].split('.');

/** @type {import('@babel/core').PluginItem} */
const presetEnvConfig = config.presets[0][1];
presetEnvConfig.useBuiltIns = 'usage';
presetEnvConfig.corejs = `${major}.${minor}`;

module.exports = config;
