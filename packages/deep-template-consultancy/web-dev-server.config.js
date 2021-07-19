const rollupReplace = require('@rollup/plugin-replace');
const { fromRollup } = require('@web/dev-server-rollup');

const replace = fromRollup(rollupReplace);

module.exports = {
  nodeResolve: true,
  open: true,
  appIndex: './build/index.html',
  plugins: [replace({ include: ['**/*.js'], __environment__: '"development"' })],
};
