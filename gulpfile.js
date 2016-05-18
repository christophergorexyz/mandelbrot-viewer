'use strict';
let gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    fs = require('fs'),
    path = require('path');

gulp.task('default', () => {
    return browserify( {
            entries: ['./src/js/index'],
        }).transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(fs.createWriteStream(path.join(__dirname, 'dist', 'index.js'), {encoding: 'utf-8'}));
});