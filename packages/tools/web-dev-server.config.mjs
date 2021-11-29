import rollupGraphQL from '@apollo-elements/rollup-plugin-graphql';
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const graphql = fromRollup(rollupGraphQL);
const replace = fromRollup(rollupReplace);

export default {
  nodeResolve: true,

  // TODO: Design
  sslKey: '/home/hayden/ssl/ssl-cert.key',
  sslCert: '/home/hayden/ssl/ssl-cert.crt',
  open: true,
  mimeTypes: {
    '**/*.graphql': 'js'
  },
  appIndex: './index.html',
  plugins: [
    graphql(),
    replace({ include: ['**/*.js'], __environment__: '"development"',
  })],
};
