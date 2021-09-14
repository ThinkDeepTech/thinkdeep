/**
 * Created a shared configuration on the specified port.
 * @param {Number} port
 */
function sharedConfig(port = 8000) {
  return {
    files: 'test/**/*.test.js',
    nodeResolve: true,
    coverage: true,
    preserveSymlinks: true,
    concurrency: 10,
    port,
  };
}

export default sharedConfig;
