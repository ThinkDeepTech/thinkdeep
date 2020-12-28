const plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/proposal-decorators', { decoratorsBeforeExport: true }],
];

const presets = ['@babel/env'];

module.exports = {
  presets,
  plugins,
};
