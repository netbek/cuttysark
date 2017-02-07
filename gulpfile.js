var _ = require('lodash');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var del = require('del');
var fs = require('fs-extra');
var gulp = require('gulp');
var livereload = require('livereload');
var nunjucks = require('nunjucks');
var open = require('open');
var os = require('os');
var path = require('path');
var Promise = require('bluebird');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var svgmin = require('gulp-svgmin');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

Promise.promisifyAll(fs);

/*******************************************************************************
 * Config
 ******************************************************************************/

var config = require('./gulp-config.js');

var livereloadOpen = (config.webserver.https ? 'https' : 'http') + '://' + config.webserver.host + ':' + config.webserver.port + (config.webserver.open ? config.webserver.open : '/');

/*******************************************************************************
 * Misc
 ******************************************************************************/

var flags = {
  livereloadInit: false // Whether `livereload-init` task has been run
};
var server;

// Choose browser for node-open.
var browser = config.webserver.browsers.default;
var platform = os.platform();
if (_.has(config.webserver.browsers, platform)) {
  browser = config.webserver.browsers[platform];
}

/*******************************************************************************
 * Functions
 ******************************************************************************/

/**
 *
 * @param  {String} src
 * @param  {String} dist
 * @return {Stream}
 */
function buildCss(src, dist) {
  return gulp
    .src(src)
    .pipe(sass(config.css.params).on('error', sass.logError))
    .pipe(autoprefixer(config.autoprefixer))
    .pipe(gulp.dest(dist))
    .pipe(cssmin({
      advanced: false
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dist));
}

/**
 *
 * @param  {String} src
 * @param  {String} dist
 * @return {Stream}
 */
function buildImg(src, dist) {
  return gulp
    .src(src)
    .pipe(gulp.dest(dist));
}

/**
 *
 * @param  {String} src
 * @param  {String} dist
 * @return {Stream}
 */
function buildJs(src, dist) {
  return gulp
    .src(src)
    .pipe(gulp.dest(dist))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
}

/**
 *
 * @param  {String} src
 * @param  {String} dist
 * @return {Stream}
 */
function buildSvg(src, dist) {
  return gulp
    .src(src)
    .pipe(svgmin({
      js2svg: {
        pretty: true
      },
      // plugins: [{
      //   cleanupIDs: {
      //     remove: false
      //   }
      // }]
    }))
    .pipe(gulp.dest(dist));
}

/**
 * Start a watcher.
 *
 * @param {Array} files
 * @param {Array} tasks
 * @param {Boolean} livereload Set to TRUE to force livereload to refresh the page.
 */
function startWatch(files, tasks, livereload) {
  if (livereload) {
    tasks.push('livereload-reload');
  }

  gulp.watch(files, function () {
    runSequence.apply(null, tasks);
  });
}

/*******************************************************************************
 * Livereload tasks
 ******************************************************************************/

// Start webserver.
gulp.task('webserver-init', function (cb) {
  var conf = _.clone(config.webserver);
  conf.open = false;

  gulp.src('./')
    .pipe(webserver(conf))
    .on('end', cb);
});

// Start livereload server
gulp.task('livereload-init', function (cb) {
  if (!flags.livereloadInit) {
    flags.livereloadInit = true;
    server = livereload.createServer();
    open(livereloadOpen, browser);
  }

  cb();
});

// Refresh page
gulp.task('livereload-reload', function (cb) {
  server.refresh(livereloadOpen);
  cb();
});

/*******************************************************************************
 * Tasks
 ******************************************************************************/

gulp.task('clean', function () {
  return del([
    'css',
    'js',
    'svg',
    'www'
  ]);
});

gulp.task('build-css', function (cb) {
  buildCss('src/css/**/*.scss', 'css/')
    .on('end', cb);
});

gulp.task('build-img', function (cb) {
  buildImg('src/img/**/*', 'img/')
    .on('end', cb);
});

gulp.task('build-js', function (cb) {
  buildJs('src/js/**/*.js', 'js/')
    .on('end', cb);
});

gulp.task('build-svg', function (cb) {
  buildSvg('src/svg/**/*.svg', 'svg/')
    .on('end', cb);
});

gulp.task('build-www', function (cb) {
  var context = {};

  return fs.readFileAsync('src/index.njk', 'utf-8')
    .then(function (data) {
      return nunjucks.renderString(data, context);
    })
    .then(function (data) {
      return fs.outputFileAsync('www/index.html', data, 'utf-8');
    });
});

gulp.task('build', function (cb) {
  runSequence(
    'clean',
    'build-css',
    'build-img',
    'build-js',
    'build-svg',
    'build-www',
    cb
  );
});

gulp.task('livereload', function () {
  runSequence(
    'build',
    'webserver-init',
    'livereload-init',
    'watch:livereload'
  );
});

/*******************************************************************************
 * Watch tasks
 ******************************************************************************/

// Watch with livereload that doesn't rebuild docs
gulp.task('watch:livereload', function (cb) {
  var livereloadTask = 'livereload-reload';

  _.forEach(config.watchTasks, function (watchConfig) {
    var tasks = _.clone(watchConfig.tasks);
    tasks.push(livereloadTask);
    startWatch(watchConfig.files, tasks);
  });
});

/*******************************************************************************
 * Default task
 ******************************************************************************/

gulp.task('default', ['build']);
