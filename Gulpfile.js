var gulp = require('gulp')
var removeCode = require('gulp-remove-code')
var replace = require('gulp-replace')

gulp.task('clean', () => {
  gulp.src('/home/genar/src/orgmode/**/*.md')
    .pipe(replace('.md', '.html'))
    .pipe(removeCode({
      commentStart: '<!--',
      commentEnd: '-->',
      production: true
    }))
  .pipe(gulp.dest('./source/'))
})

gulp.task('move files', () => {
})

gulp.task('default', ['clean'])
