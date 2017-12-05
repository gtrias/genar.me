var gulp = require('gulp')
var stripCode = require('gulp-strip-code')
var replace = require('gulp-replace')

gulp.task('clean', () => {
  gulp.src('/home/genar/src/orgmode/**/*.md')
    .pipe(replace('.md', '.html'))
    .pipe(stripCode({
      pattern: /\[start_ignore\][\s\S]*?(?:\[end_ignore\].*)/g
    }))
    .pipe(gulp.dest('./source/'))
})

gulp.task('move files', () => {
})

gulp.task('default', ['clean'])
