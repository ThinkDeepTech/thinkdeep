import graphql from '@rollup/plugin-graphql';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import injectEnv from 'rollup-plugin-inject-process-env';
import {rollupPluginHTML as html} from '@web/rollup-plugin-html';
import copy from 'rollup-plugin-copy'
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

export default merge(createSpaConfig, {
  input: 'index.html',
  output: {
    dir: 'build',
    format: 'es'
  },
  plugins: [
    nodeResolve(),
    eslint(),
    babel({ babelHelpers: 'bundled', rootMode: "upward" }),
    html(),
    graphql(),
    injectEnv({
      PREDECOS_AUTH_DOMAIN: process.env.PREDECOS_AUTH_DOMAIN,
      PREDECOS_AUTH_CLIENT_ID: process.env.PREDECOS_AUTH_CLIENT_ID,
      PREDECOS_AUTH_AUDIENCE: process.env.PREDECOS_AUTH_AUDIENCE,
      PREDECOS_MICROSERVICE_GATEWAY_URL: process.env.PREDECOS_MICROSERVICE_GATEWAY_URL,
      PREDECOS_MICROSERVICE_SUBSCRIPTION_URL: process.env.PREDECOS_MICROSERVICE_SUBSCRIPTION_URL
    }),
    copy({
      targets: [
        { src: 'img/**/*', dest: 'build/img' },
        { src: 'font/**/*', dest: 'build/font' },
        { src: 'locales/**/*', dest: 'build/locales'}
      ]
    })
  ],
});