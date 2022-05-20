import rollupGraphQL from '@rollup/plugin-graphql';
import rollupReplace from '@rollup/plugin-replace';
import {fromRollup} from '@web/dev-server-rollup';

const graphql = fromRollup(rollupGraphQL);
const replace = fromRollup(rollupReplace);

export default {
  nodeResolve: true,

  http2: true,
  sslKey: '/home/hayden/ssl/localhost.key.pem',
  sslCert: '/home/hayden/ssl/localhost.cert.pem',
  open: true,
  mimeTypes: {
    '**/*.graphql': 'js',
  },
  appIndex: './index.html',
  plugins: [
    replace({
      'process.env.PREDECOS_AUTH_DOMAIN': JSON.stringify(
        process.env.PREDECOS_AUTH_DOMAIN
      ),
      'process.env.PREDECOS_AUTH_CLIENT_ID': JSON.stringify(
        process.env.PREDECOS_AUTH_CLIENT_ID
      ),
      'process.env.PREDECOS_AUTH_AUDIENCE': JSON.stringify(
        process.env.PREDECOS_AUTH_AUDIENCE
      ),
      'process.env.PREDECOS_MICROSERVICE_GATEWAY_URL': JSON.stringify(
        process.env.PREDECOS_MICROSERVICE_GATEWAY_URL
      ),
      'process.env.PREDECOS_MICROSERVICE_SUBSCRIPTION_URL': JSON.stringify(
        process.env.PREDECOS_MICROSERVICE_SUBSCRIPTION_URL
      ),
    }),
    graphql(),
  ],
};
