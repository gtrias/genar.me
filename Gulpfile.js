var gulp = require('gulp')
var stripCode = require('gulp-strip-code')
var replace = require('gulp-replace')
var gulpIgnore = require('gulp-ignore')
var hexoIgnore = require('/home/genar/src/orgmode/hexoignore.json')

gulp.task('clean', () => {
  gulp.src('/home/genar/src/orgmode/**/*.md')
    .pipe(gulpIgnore.exclude(hexoIgnore.ignore))
    .pipe(replace('.md', '.html'))
    .pipe(stripCode({
      pattern: /\[start_ignore\][\s\S]*?(?:\[end_ignore\].*\n+?)/g
    }))
    .pipe(gulp.dest('./source/'))
})

gulp.task('move files', () => {
})

gulp.task('default', ['clean'])
