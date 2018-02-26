module.exports = {
  autoprefixer: {
    browsers: [
      'last 2 versions',
      'ie >= 8',
      'ff >= 5',
      'chrome >= 20',
      'opera >= 12',
      'safari >= 4',
      'ios >= 6',
      'android >= 2',
      'bb >= 6'
    ]
  },
  css: {
    params: {
      includePaths: [
        'node_modules/bourbon/app/assets/stylesheets/',
        'node_modules/breakpoint-sass/stylesheets/',
        'node_modules/mathsass/dist/',
        'node_modules/singularitygs/stylesheets/'
      ],
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
