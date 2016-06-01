'use strict';
let gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    express = require('gulp-express');


gulp.task('browserify', () => {
    mkdirp('dist/js');
    return browserify({
            entries: ['src/js/index'],
            standalone: 'mandelbrot',
            debug: true
        })
        .transform(babelify, {
            presets: ['es2015']
        })
        .bundle()
        .on('error', function (err) {
            console.log();
            console.log("Error: " + err.message);

            console.log("\tFile: " + err.filename);
            console.log("\tLine: " + err.loc.line);
            console.log("\tColumn: " + err.loc.column);
            console.log(err.codeFrame);
            this.emit('end');
        })
        .pipe(fs.createWriteStream(path.join(__dirname, 'dist/js', 'index.js'), {
            encoding: 'utf-8'
        }));
});

gulp.task('html', () => {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('server', () => {
    return gulp.src('src/index.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['browserify', 'html', 'server']);

gulp.task('dev', ['build', 'server'], () => {
    express.run(['./index.js'], {
        cwd: 'dist'
    });
    gulp.watch('src/**/*', ['build'], express.notify);
});

gulp.task('default', ['dev']);
