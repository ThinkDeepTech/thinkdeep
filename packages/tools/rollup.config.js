const createSpaConfig = require('@open-wc/building-rollup').createSpaConfig;

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

module.exports = baseConfig;
