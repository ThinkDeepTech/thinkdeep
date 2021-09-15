import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import html from '@web/rollup-plugin-html';
import merge from 'deepmerge';
import { createSpaConfig } from '@open-wc/building-rollup';

const baseConfig = createSpaConfig({
  // use the outputdir option to modify where files are output
  outputDir: 'build',

  // if you need to support older browsers, such as IE11, set the legacyBuild
  // option to generate an additional build just for this browser
  // legacyBuild: true,

  // development mode creates a non-minified build for debugging or development
  // developmentMode: process.env.ROLLUP_WATCH === 'true',

  // set to true to inject the service worker registration into your index.html
  injectServiceWorker: false,
});

console.log(process.cwd());

export default merge(createSpaConfig, {
  input: 'index.html',
  extensions: [
    '.js', '.mjs'
  ],
  plugins: [nodeResolve(), eslint(), babel({ babelHelpers: 'bundled', rootMode: "upward", configFile: "babel.config.mjs" }), html()],
});