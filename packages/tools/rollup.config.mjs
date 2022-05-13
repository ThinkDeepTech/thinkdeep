import graphql from '@rollup/plugin-graphql';
import nodeResolve from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import injectEnv from 'rollup-plugin-inject-process-env';
import {rollupPluginHTML as html} from '@web/rollup-plugin-html';
import copy from 'rollup-plugin-copy'

export default {
  input: 'index.html',
  output: {
    dir: 'build',
    format: 'es'
  },
  plugins: [
    nodeResolve({ browser: true }),
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
};