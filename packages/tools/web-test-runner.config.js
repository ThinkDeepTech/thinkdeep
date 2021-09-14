/**
 * Created a shared configuration on the specified port.
 * @param {Number} port
 */
function sharedConfig(port = 8000) {
  return {
    files: 'test/**/*.test.js',
    nodeResolve: true,
    coverage: true,
    playwright: true,
    browsers: ['chromium', 'firefox'],
    preserveSymlinks: true,
    concurrency: 1,
    port,
  };
}

export default sharedConfig;

// "tests": "web-test-runner \"test/**/*.test.js\" --node-resolve --coverage --playwright --browsers chromium firefox --preserveSymlinks --port 10002",
