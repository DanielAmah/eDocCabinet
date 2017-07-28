import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import jasmineNode from 'gulp-jasmine-node';
import istanbul from 'gulp-istanbul';
import injectModules from 'gulp-inject-modules';
import exit from 'gulp-exit';
import coveralls from 'gulp-coveralls';
import mocha from 'gulp-mocha';


gulp.task('nodemon', () => {
  nodemon({
    script: 'build/server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['server']
  });
});

gulp.task('dev', () => gulp.src('server/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'stage-2']
    }))
    .pipe(gulp.dest('build')));

gulp.task('default', ['dev', 'nodemon'], () => {
  gulp.watch('server/**/*.js', ['dev']);
});

// const jasmineNodeOpts = {
//   timeout: 200000,
//   includeStackTrace: false,
//   color: true
// };

// gulp.task('api-tests', () => {
//   gulp.src('./test/server**/*.js')
//     .pipe(babel())
//     .pipe(jasmineNode(jasmineNodeOpts));
// });

gulp.task('coveralls', () => gulp.src('./coverage/lcov')
    .pipe(coveralls()));

// gulp.task('default', () =>
//     gulp.src('./test/server**/*.js')
//         // gulp-jasmine works on filepaths so you can't have any plugins before it
//         .pipe(jasmine())
// );
gulp.task('pre-test', () => gulp.src(['test/server/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire()));

gulp.task('test', ['pre-test'], () => gulp.src(['test/server/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } })));

gulp.task('coverage', (cb) => {
  gulp.src('build/controllers/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('test/server/*.js')
      .pipe(babel())
      .pipe(injectModules())
      .pipe(jasmineNode())
      .pipe(istanbul.writeReports())
      .pipe(istanbul.enforceThresholds({ thresholds: { global: 30 } }))
      .on('end', cb)
      .pipe(exit());
    });
});

gulp.task('coveralls', () => gulp.src('./coverage/lcov')
    .pipe(coveralls()));
