const plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/proposal-decorators', { decoratorsBeforeExport: true }],
  '@babel/plugin-transform-modules-commonjs',
];

export default {
  plugins,
  presets: [
    [ '@babel/preset-env', { modules: false } ]
  ],
  targets: {
    chrome: '91',
    firefox: '91',
  },
};
