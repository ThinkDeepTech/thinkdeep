import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';

/**
 *  Get the default build configuration.
 *
 * @param {String} packagePath - Path to package to be built.
 * @return {Object} - Default package configuration for Rollup.
 */
function defaultConfiguration(packagePath) {
  return {
    input: [packagePath + '/index.js'],
    output: {
      file: 'build/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [nodeResolve(), eslint(), babel()],
  };
}

export default {
  defaultConfiguration: defaultConfiguration,
};
