var gulp = require('gulp')
var stripCode = require('gulp-strip-code')
var replace = require('gulp-replace')
var gulpIgnore = require('gulp-ignore')
var hexoIgnore = require('/home/genar/src/orgmode/hexoignore.json')

const defaultTask = (cb) => {
  gulp.src('/home/genar/src/orgmode/**/*.md')
    .pipe(gulpIgnore.exclude(hexoIgnore.ignore))
    .pipe(gulpIgnore.exclude('**/.*'))
    .pipe(replace('.md', '.html'))
    .pipe(stripCode({
      pattern: /\[start_ignore\][\s\S]*?(?:\[end_ignore\].*\n+?)/g
    }))
    .pipe(gulp.dest('./source/_posts'))

  gulp.src('/home/genar/src/orgmode/index.md')
    .pipe(gulpIgnore.exclude(hexoIgnore.ignore))
    .pipe(gulpIgnore.exclude('**/.*'))
    .pipe(replace('.md', '.html'))
    .pipe(stripCode({
      pattern: /\[start_ignore\][\s\S]*?(?:\[end_ignore\].*\n+?)/g
    }))
    .pipe(gulp.dest('./source/'))

  cb()
}

exports.default = defaultTask
