const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: path.resolve(__dirname),
    browsers: ['Chrome', 'Firefox'],
    preprocessors: {
      'test/**/*.js': ['rollup'],
    },
    rollupPreprocessor: {
      // will help to prevent conflicts between different tests entries
      format: 'iife',
      sourceMap: 'inline',
    },
    singleRun: true,
  });
};
