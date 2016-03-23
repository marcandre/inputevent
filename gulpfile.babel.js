import gulp  from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import del  from 'del';
import glob  from 'glob';
import path  from 'path';
import isparta  from 'isparta';
import babelify  from 'babelify';
import watchify  from 'watchify';
import buffer  from 'vinyl-buffer';
import esperanto  from 'esperanto';
import browserify  from 'browserify';
import runSequence  from 'run-sequence';
import source  from 'vinyl-source-stream';

import manifest  from './package.json';

// Load all of our Gulp plugins
const $ = loadPlugins();

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));

// Remove a directory
function _clean(dir, done) {
  del([dir], done);
}

function cleanDist(done) {
  _clean(destinationFolder, done)
}

function cleanTmp() {
  _clean('tmp', done)
}

// Send a notification when JSCS fails,
// so that you know your changes didn't build
function _jscsNotify(file) {
  if (!file.jscs) { return; }
  return file.jscs.success ? false : 'JSCS failed';
}

// Lint a set of files
function lint(files) {
  return gulp.src(files)
    .pipe($.plumber())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
    .pipe($.jscs())
    .pipe($.notify(_jscsNotify));
}

function lintSrc() {
  return lint('src/**/*.js');
}

function lintTest() {
  return lint('test/**/*.js');
}

function build(done) {
  esperanto.bundle({
    base: 'src',
    entry: config.entryFileName,
  }).then(bundle => {
    const res = bundle.toUmd({
      // Don't worry about the fact that the source map is inlined at this step.
      // `gulp-sourcemaps`, which comes next, will externalize them.
      sourceMap: 'inline',
      name: config.mainVarName
    });

    $.file(exportFileName + '.js', res.code, { src: true })
      .pipe($.plumber())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.babel())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .pipe($.filter(['*', '!**/*.js.map']))
      .pipe($.rename(exportFileName + '.min.js'))
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.uglify())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .on('end', done);
  })
  .catch(done);
}

function _runBrowserifyBundle(bundler) {
  return bundler.bundle()
    .on('error', err => {
      console.log(err.message);
      this.emit('end');
    })
    .pipe($.plumber())
    .pipe(source('./tmp/__spec-build.js'))
    .pipe(buffer())
    .pipe(gulp.dest(''))
    .pipe($.livereload());
}

// Build the unit test suite for running tests
// in the browser
function _browserifyBundle() {
  // Our browserify bundle is made up of our unit tests, which
  // should individually load up pieces of our application.
  // We also include the browserify setup file.
  const testFiles = glob.sync('./test/unit/**/*.js');
  const allFiles = ['./test/setup/browserify.js'].concat(testFiles);

  // Create our bundler, passing in the arguments required for watchify
  let bundler = browserify(allFiles, watchify.args);

  // Watch the bundler, and re-bundle it whenever files change
  bundler = watchify(bundler);
  bundler.on('update', () => _runBrowserifyBundle(bundler));

  // Set up Babelify so that ES6 works in the tests
  bundler.transform(babelify.configure({
    sourceMapRelative: __dirname + '/src'
  }));

  return _runBrowserifyBundle(bundler);
}

function _mocha() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({reporter: 'dot', globals: config.mochaGlobals}));
}

function _registerBabel() {
  require('babel-core/register');
}

function test() {
  _registerBabel();
  return _mocha();
}

function coverage(done) {
  _registerBabel();
  gulp.src(['src/**/*.js'])
    .pipe($.istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
}

// These are JS files that should be watched by Gulp. When running tests in the browser,
// watchify is used instead, so these aren't included.
const jsWatchFiles = ['src/**/*', 'test/**/*'];
// These are files other than JS files which are to be watched. They are always watched.
const otherWatchFiles = ['package.json', '**/.eslintrc', '.jscsrc'];

// Run the headless unit tests as you make changes.
function watch() {
  const watchFiles = jsWatchFiles.concat(otherWatchFiles);
  gulp.watch(watchFiles, ['test']);
}

function testBrowser() {
  // Ensure that linting occurs before browserify runs. This prevents
  // the build from breaking due to poorly formatted code.
  runSequence(['lint-src', 'lint-test'], () => {
    _browserifyBundle();
    $.livereload.listen({port: 35729, host: 'localhost', start: true});
    gulp.watch(otherWatchFiles, ['lint-src', 'lint-test']);
  });
}

// Remove the built files
gulp.task('clean', cleanDist);

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp);

// Lint our source code
gulp.task('lint-src', lintSrc);

// Lint our test code
gulp.task('lint-test', lintTest);

// Build two versions of the library
gulp.task('build', ['lint-src', 'clean'], build);

// Lint and run our tests
gulp.task('test', ['lint-src', 'lint-test'], test);

// Set up coverage and run tests
gulp.task('coverage', ['lint-src', 'lint-test'], coverage);

// Set up a livereload environment for our spec runner `test/runner.html`
gulp.task('test-browser', testBrowser);

// Run the headless unit tests as you make changes.
gulp.task('watch', watch);

// An alias of test
gulp.task('default', ['test']);
