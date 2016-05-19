'use strict';
let gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');


gulp.task('browserify', () => {
    mkdirp('dist/js');
    return browserify({
            entries: ['src/js/index'],
        }).transform(babelify, {
            presets: ['es2015']
        }).bundle()
        .pipe(fs.createWriteStream(path.join(__dirname, 'dist/js', 'index.js'), {
            encoding: 'utf-8'
        }));
});

gulp.task('html', () => {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['browserify', 'html']);

gulp.task('default', ['build', 'watch']);

gulp.task('watch', () => {
    gulp.watch('src/**/*', ['build']);
});