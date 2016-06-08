'use strict';
let gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('browserify'),
    babel = require('gulp-babel'),
    express = require('gulp-express'),
    babelify = require('babelify'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path');

gulp.task('browserify', () => {
    return mkdirp('dist/static/js', function (err) {
        if (err) {
            gutil.log(err);
        }
        browserify({
                entries: ['src/static/js/index'],
                standalone: 'mandelbrot',
                debug: true
            })
            .transform(babelify, {
                presets: ['es2015']
            })
            .bundle()
            .on('error', gutil.log)
            .pipe(fs.createWriteStream(path.join(__dirname, 'dist/static/js', 'index.js'), {
                encoding: 'utf-8'
            }));
    });
});


gulp.task('html', () => {
    return gulp.src('src/static/index.html')
        .pipe(gulp.dest('dist/static'));
});

gulp.task('server', () => {
    gulp.src(['src/graphics/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/graphics'));

    return gulp.src(['src/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
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
