import {playwrightLauncher} from '@web/test-runner-playwright';
import rollupGraphQL from '@rollup/plugin-graphql';
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const graphql = fromRollup(rollupGraphQL);
const replace = fromRollup(rollupReplace);

import getPort from 'get-port';

const browsers = {
  chromium: playwrightLauncher({product: 'chromium', launchOptions: {
    headless: true,
    devtools: true,
    args: ['--incognito'],
  }}),
  firefox: playwrightLauncher({product: 'firefox'}),
};

// Get a random port number.
const port = await getPort();

export default {
  files: ['test/**/*.test.js', 'test/**/*.test.mjs'],
  nodeResolve: true,
  browsers: Object.values(browsers),
  coverage: true,
  preserveSymlinks: true,
  concurrency: 1,
  browserStartTimeout: 60000,
  testsStartTimeout: 20000,
  testsFinishTimeout: 180000,
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: 10000,
    },
  },
  port,
  mimeTypes: {
    '**/*.graphql': 'js'
  },
  plugins: [
    graphql(),
  ],
};
