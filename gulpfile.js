'use strict';
let gulp = require('gulp'),
    gutil = require('gulp-util'),
    babel = require('babel-core'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    express = require('gulp-express');


gulp.task('browserify', () => {
    mkdirp('dist/static/js');
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

    return babel.transformFile('src/renderer', {
        presets: ['es2015'],
        sourceMaps: false
    }, function (err, result) {
        if (err) {
            return gutil.log(err);
        }
        var ws = fs.createWriteStream(path.join(__dirname, 'dist', 'renderer.js'));
        ws.write(result.code);
        ws.end();
    });
    //.pipe(fs.createWriteStream(path.join(__dirname, 'dist', 'renderer.js')));

    /*
    return browserify('src/renderer')
        .transform(babelify, {
            presets: ['es2015']
        })
        .bundle()
        .on('error', gutil.log)
        .pipe(fs.createWriteStream(path.join(__dirname, 'dist', 'renderer.js'), {
            encouding: 'utf-8'
        }));*/
});


gulp.task('html', () => {
    return gulp.src('src/static/index.html')
        .pipe(gulp.dest('dist/static'));
});

gulp.task('server', () => {
    return gulp.src('src/*.js')
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
