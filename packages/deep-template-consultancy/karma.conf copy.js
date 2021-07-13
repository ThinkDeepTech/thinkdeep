// Karma configuration
// Generated on Sat Jul 10 2021 17:35:16 GMT-0400 (Eastern Daylight Time)

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['requirejs', 'browserify', 'mocha', 'chai'],

    // plugins to use
    plugins: [
      'karma-requirejs',
      'karma-mocha',
      'karma-chai',
      'karma-babel-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-browserify',
    ],

    // list of files / patterns to load in the browser
    files: [
      'test-main.js',
      { pattern: '**/*.js', included: false },
      { pattern: 'test/**/*.test.js', included: false },
    ],

    // list of files / patterns to exclude
    exclude: ['node_modules', '**/node_modules/**/*.js', '**/*.conf.js'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'test-main.js': ['browserify', 'babel'],
      '**/*.js': ['browserify', 'babel'],
      'test/**/*.test.js': ['browserify', 'babel'],
    },

    babelPreprocessor: {
      options: {
        presets: ['@babel/preset-env'],
        sourceMap: 'inline',
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],

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
    browsers: ['Chrome', 'Firefox'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,

    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 60000,
  });
};
