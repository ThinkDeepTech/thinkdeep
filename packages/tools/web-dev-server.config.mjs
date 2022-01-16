import rollupGraphQL from '@rollup/plugin-graphql';
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const graphql = fromRollup(rollupGraphQL);
const replace = fromRollup(rollupReplace);

export default {
  nodeResolve: true,

  sslKey: '/home/hayden/ssl/ssl-cert.key',
  sslCert: '/home/hayden/ssl/ssl-cert.crt',
  open: true,
  mimeTypes: {
    '**/*.graphql': 'js'
  },
  appIndex: './index.html',
  plugins: [
    replace({
      PREDECOS_AUTH_AUDIENCE: JSON.stringify(process.env.PREDECOS_AUTH_AUDIENCE),
      PREDECOS_MICROSERVICE_GATEWAY_URL: JSON.stringify(process.env.PREDECOS_MICROSERVICE_GATEWAY_URL),
      PREDECOS_MICROSERVICE_SUBSCRIPTION_URL: JSON.stringify(process.env.PREDECOS_MICROSERVICE_SUBSCRIPTION_URL)
    }),
    graphql(),
  ],
};
