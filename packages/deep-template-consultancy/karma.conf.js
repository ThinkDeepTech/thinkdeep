// const buble = require('@rollup/plugin-buble');
// const { nodeResolve } = require('@rollup/plugin-node-resolve');
// const babel = require('@rollup/plugin-babel');
// const eslint = require('@rollup/plugin-eslint');

// const babelConfig = require('./babel.config');

// Karma configuration
// Generated on Tue Jul 13 2021 08:03:13 GMT-0400 (Eastern Daylight Time)

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['esm', 'mocha', 'chai'],

    // plugins to use
    plugins: [require.resolve('@open-wc/karma-esm'), 'karma-*'],

    esm: {
      // if you are using 'bare module imports' you will need this option
      nodeResolve: true,
    },

    // list of files / patterns to load in the browser
    files: [
      { pattern: './**/*.js', type: 'module', nocache: true, included: true },
      { pattern: './test/**/*.js', type: 'module', nocache: true, included: true },
    ],

    // list of files / patterns to exclude
    exclude: ['build/bundles/**/*.js', '../**/*.config.js'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress', 'coverage'],

    coverageReporter: {
      reporters: [{ type: 'html', subdir: 'html' }],
      dir: 'coverage/',
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['firefox_private', 'Chrome', 'Edge'],

    customLaunchers: {
      firefox_private: {
        base: 'Firefox',
        flags: ['-private'],
        displayName: 'Firefox Private Mode',
      },
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
  });
};
