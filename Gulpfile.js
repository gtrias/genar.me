var gulp = require('gulp')
var stripCode = require('gulp-strip-code')
var replace = require('gulp-replace')
var gulpIgnore = require('gulp-ignore')

var conditions = ['personal.md', 'regalo-xurri.md', 'jobs.md']

gulp.task('clean', () => {
  gulp.src('/home/genar/src/orgmode/**/*.md')
    .pipe(gulpIgnore.exclude(conditions))
    .pipe(replace('.md', '.html'))
    .pipe(stripCode({
      pattern: /\[start_ignore\][\s\S]*?(?:\[end_ignore\].*\n+?)/g
    }))
    .pipe(gulp.dest('./source/'))
})

gulp.task('move files', () => {
})

gulp.task('default', ['clean'])
