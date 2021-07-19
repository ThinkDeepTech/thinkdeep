import { nodeResolve } from '@rollup/plugin-node-resolve';
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
  plugins: [nodeResolve(), eslint()],
};
