import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';

gulp.task('nodemon', () => {
  nodemon({
    script: 'build/server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['server']
  });
});

gulp.task('dev', () =>
  gulp.src('server/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'stage-2']
    }))
    .pipe(gulp.dest('build'))
);

gulp.task('default', ['dev', 'nodemon'], () => {
  gulp.watch('server/**/*.js', ['dev']);
});
