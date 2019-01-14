const {browserslist} = require('./package.json');

module.exports = {
  autoprefixer: {
    browsers: browserslist
  },
  css: {
    params: {
      includePaths: [],
      errLogToConsole: true
    }
  },
  src: {
    vendor: 'src/vendor/'
  },
  dist: {
    vendor: 'demo/vendor/'
  },
  modernizr: {
    cache: false,
    crawl: false,
    options: ['setClasses', 'addTest', 'testProp', 'fnBind', 'prefixed'],
    tests: ['inlinesvg', 'svg', 'svgclippaths']
  },
  watchTasks: [
    //
    {
      files: ['src/**/*'],
      tasks: ['build']
    }
  ],
  webserver: {
    host: 'localhost',
    port: 8000,
    path: '/',
    livereload: false,
    directoryListing: false,
    open: '/demo/',
    https: false,
    browsers: {
      default: 'firefox',
      darwin: 'google chrome',
      linux: 'google-chrome',
      win32: 'chrome'
    }
  }
};
