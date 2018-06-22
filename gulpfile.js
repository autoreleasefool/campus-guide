var gulp = require('gulp');
var ts = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build.ts', function() {
  // const tsResult = gulp.src('./src/**/*.ts').pipe(tsProject())
  // return tsResult.js.pipe()
  return gulp.src('./src/**/*.ts')
      .pipe(tsProject())
      .js
      .pipe(gulp.dest('test-artifacts'));
});

gulp.task('build.copy-assets', function() {
  return gulp.src(['./src/**/*', '!./**/*.ts'])
      .pipe(gulp.dest('test-artifacts'));
});

gulp.task('default', ['build.ts', 'build.copy-assets']);
