const plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/proposal-decorators', { decoratorsBeforeExport: true }],
  '@babel/plugin-transform-modules-commonjs',
];

module.exports = {
  plugins,
  presets: ['@babel/preset-env'],
  targets: {
    chrome: '91',
    firefox: '91',
  },
};
