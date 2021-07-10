import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';

export default {
  input: ['./index.js'],
  output: [
    {
      file: 'build/index.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [nodeResolve(), eslint(), babel({ babelHelpers: 'bundled' })],
};
