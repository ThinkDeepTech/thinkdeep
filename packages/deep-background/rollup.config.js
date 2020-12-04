import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
  input: ['src/index.js'],
  output: {
    file: 'build/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [resolve(), babel(), serve('build')]
};
