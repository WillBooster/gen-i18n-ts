module.exports = function config(api) {
  api.cache(true);

  return require('@willbooster/babel-configs/babel.config.cjs');
};
