/**
 * Created a shared configuration on the specified port.
 * @param {Number} port
 */

 import {playwrightLauncher} from '@web/test-runner-playwright';

 const browsers = {
  chromium: playwrightLauncher({product: 'chromium', launchOptions: {
    headless: true,
    devtools: true,
    args: ['--incognito'],
  }}),
  firefox: playwrightLauncher({product: 'firefox'}),
 };

function sharedConfig(port = 8000) {
  return {
    files: 'test/**/*.test.js',
    nodeResolve: true,
    browsers: Object.values(browsers),
    coverage: true,
    preserveSymlinks: true,
    concurrency: 1,
    browserStartTimeout: 60000,
    port,
  };
}

export default sharedConfig;
