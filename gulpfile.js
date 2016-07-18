'use strict';
let gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('browserify'),
    babel = require('gulp-babel'),
    gls = require('gulp-live-server'),
    babelify = require('babelify'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    path = require('path'),
    injectReload = require('gulp-inject-reload'),
    gopen = require('gulp-open');

let prod = process.env.NODE_ENV === 'production';

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
    return gulp.src('src/static/**/*.html')
        .pipe(prod ? gutil.noop() : injectReload())
        .pipe(gulp.dest('dist/static'));
});

gulp.task('server', () => {
    gulp.src(['src/graphics/**/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }).on('error', gutil.log))
        .pipe(gulp.dest('dist/graphics'));

    return gulp.src(['src/index.js'])
        .pipe(babel({
            presets: ['es2015']
        }).on('error', gutil.log))
        .pipe(gulp.dest('dist'));

});

gulp.task('build', ['browserify', 'html', 'server']);

gulp.task('dev', ['build'], () => {
    let server = gls('./index.js', {
        cwd: 'dist',
    });
    server.start();

    server.server.stdout.on('data', (message) => {
        gutil.log(message);
        gulp.src(__filename).pipe(
            gopen({
                uri: 'http://localhost:3000'
            })
        );
    });

    gulp.watch(['src/graphics/**/*.js', 'src/index.js'], ['server']);
    gulp.watch(['src/static/**/*.html'], ['html']);
    gulp.watch(['src/graphics/**/*.js', 'src/static/js/**/*.js'], ['browserify']);

    gulp.watch(['dist/static/**/*'], (file) => {
        server.notify.apply(server, [file]);
    });
    gulp.watch('dist/index.js', function(){
        server.start.bind(server)();
    });
});

gulp.task('default', ['dev']);
