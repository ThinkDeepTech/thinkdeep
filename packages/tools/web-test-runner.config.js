import {playwrightLauncher} from '@web/test-runner-playwright';
import rollupGraphQL from '@rollup/plugin-graphql';
import rollupInjectEnv from 'rollup-plugin-inject-process-env';
import {fromRollup} from '@web/dev-server-rollup';

import getPort from 'get-port';

const graphql = fromRollup(rollupGraphQL);
const injectEnv = fromRollup(rollupInjectEnv);

const browsers = {
  chromium: playwrightLauncher({
    product: 'chromium',
    createBrowserContext: ({browser}) =>
      browser.newContext({ignoreHTTPSErrors: true}),
    launchOptions: {
      headless: true,
      devtools: true,
      args: ['--incognito'],
    },
  }),
  firefox: playwrightLauncher({
    product: 'firefox',
    createBrowserContext: ({browser}) =>
      browser.newContext({ignoreHTTPSErrors: true}),
    launchOptions: {
      headless: true,
    },
  }),
};

// Get a random port number.
const port = await getPort();

export default {
  files: ['test/**/*.test.js', 'test/**/*.test.js'],
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    reporters: ['json'],
    exclude: ['**/node_modules/**', '**/charts/**'],
  },
  browsers: Object.values(browsers),
  preserveSymlinks: true,
  concurrency: 1,
  browserStartTimeout: 60000,
  testsStartTimeout: 20000,
  testsFinishTimeout: 180000,
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: 20000,
    },
  },
  port,
  mimeTypes: {
    '**/*.graphql': 'js',
  },
  plugins: [
    graphql(),
    injectEnv({
      PREDECOS_AUTH_DOMAIN: process.env.PREDECOS_TEST_AUTH_DOMAIN,
      PREDECOS_AUTH_CLIENT_ID: process.env.PREDECOS_TEST_AUTH_CLIENT_ID,
      PREDECOS_AUTH_AUDIENCE: process.env.PREDECOS_TEST_AUTH_AUDIENCE,
      PREDECOS_MICROSERVICE_GATEWAY_URL:
        process.env.PREDECOS_TEST_MICROSERVICE_GATEWAY_URL,
      PREDECOS_MICROSERVICE_SUBSCRIPTION_URL:
        process.env.PREDECOS_TEST_MICROSERVICE_SUBSCRIPTION_URL,

      // Testing-specific values
      PREDECOS_TEST_AUTH_PREMIUM_USERNAME:
        process.env.PREDECOS_TEST_AUTH_PREMIUM_USERNAME,
      PREDECOS_TEST_AUTH_PREMIUM_PASSWORD:
        process.env.PREDECOS_TEST_AUTH_PREMIUM_PASSWORD,
      PREDECOS_TEST_AUTH_STANDARD_USERNAME:
        process.env.PREDECOS_TEST_AUTH_STANDARD_USERNAME,
      PREDECOS_TEST_AUTH_STANDARD_PASSWORD:
        process.env.PREDECOS_TEST_AUTH_STANDARD_PASSWORD,

      PREDECOS_TEST_AUTH_SCOPE: process.env.PREDECOS_TEST_AUTH_SCOPE,
      PREDECOS_TEST_AUTH_CLIENT_SECRET:
        process.env.PREDECOS_TEST_AUTH_CLIENT_SECRET,
      PREDECOS_TEST_AUTH_LOGIN_URL: `https://${process.env.PREDECOS_TEST_AUTH_DOMAIN}/oauth/token`,
      NODE_ENV: process.env.NODE_ENV,
    }),
  ],
};
