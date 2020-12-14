const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');

/**
 *  Get the default build configuration.
 *
 * @param {String} packagePath - Path to package to be built.
 * @return {Object} - Default package configuration for Rollup.
 */
function defaultConfiguration(packagePath) {
  if (!packagePath.length) return {};

  //  TODO: Avoid assumption that package name and entry filename will match.
  const parts = packagePath.split('/');
  const packageName = parts[parts.length - 1];

  return {
    input: [packagePath + '/' + packageName + '.js'],
    output: {
      file: 'build/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [resolve(), babel()],
  };
}

module.exports = {
  defaultConfiguration,
};
