const gulp = require('gulp');
const gulpif = require('gulp-if');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const sequence = require('gulp-sequence');
const beeper = require('beeper');

const source = {
  js: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
  lib: ['lib/**/*.js'],
  test: ['test/**/*.test.js']
};

gulp.task('lint', () => {
  return gulp.src(source.js)
    .pipe(eslint())
    .pipe(eslint.results((results) => {
      if (results.warningCount || results.errorCount) {
        beeper();
      }
    }))
    .pipe(eslint.format())
    .pipe(gulpif(gulp.seq.indexOf('watch') < 0, eslint.failAfterError()));
});

gulp.task('test', () => {
  return gulp.src(source.test)
    .pipe(mocha());
});

gulp.task('coverage-instrument', () => {
  return gulp.src(source.lib)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('coverage-report', () => {
  return gulp.src(source.test)
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: 98,
        each: 90
      }
    }));
});

gulp.task('coverage', sequence('coverage-instrument', 'test', 'coverage-report'));

gulp.task('watch', ['default'], () => {
  gulp.watch(source.js, ['default']);
});

gulp.task('default', (done) => {
  sequence('lint', 'test', done);
});
