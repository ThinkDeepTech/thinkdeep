const plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/proposal-decorators', { decoratorsBeforeExport: true }]
];

const config = {
  plugins,
  presets: [
    [ '@babel/preset-env', { modules: false } ]
  ],
  targets: {
    chrome: '91',
    firefox: '91',
  },
};

console.log('\n\nBabel Configuration:\n');
console.log(JSON.stringify(config));
console.log('\n');

export default config;