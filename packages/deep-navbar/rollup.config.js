// import { defaultConfiguration } from '@thinkdeep/tools/build.js';

// export default defaultConfiguration( __dirname );

import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import copy from 'rollup-plugin-copy';

const copyConfig = {
  targets: [
    { src: '../../node_modules/@webcomponents', dest: './build/node_modules' },
    { src: './index.html', dest: 'build' },
    { src: './deep-navbar.js', dest: 'build' },
  ],
};

export default {
  input: [__dirname + '/index.js'],
  output: {
    file: 'build/index.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    eslint(),
    babel({
      babelHelpers: 'bundled',
      plugins: [
        '@babel/plugin-proposal-class-properties',
        ['@babel/proposal-decorators', { decoratorsBeforeExport: true }],
      ],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    }),
    copy(copyConfig),
    nodeResolve(),
  ],
};
