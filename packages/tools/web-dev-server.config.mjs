import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const replace = fromRollup(rollupReplace);

export default {
  nodeResolve: true,
  open: true,
  appIndex: './index.html',
  plugins: [
    replace({ include: ['**/*.js'], __environment__: '"development"',
  })],
};
