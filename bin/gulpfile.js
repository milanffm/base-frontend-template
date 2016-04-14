'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var assign = require('lodash').assign;

const DIST = {
    CSS : './../dist/css',
    JS : './../dist/js'
};

const SCSS_SRC = './scss/**/*.scss';
const JS_START = './js/app.js';

// add custom browserify options here
var customOpts = {
    entries: [JS_START],
    debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js-watch', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

gulp.task('scss', function () {
    return gulp.src(SCSS_SRC)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(DIST.CSS));
});

gulp.task('scss-build', function () {
    return gulp.src(SCSS_SRC)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(DIST.CSS));
});

// watch task for scss
gulp.task('scss-watch', function () {
    gulp.watch(SCSS_SRC, ['scss']);
});


function bundle() {
    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest(DIST.JS));
}


gulp.task('clean', function () {
    return del([
        './../dist/*'
    ], {force: true});
});

// js build task
gulp.task('js-build', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: JS_START,
        debug: true
    });

    return b.bundle()
        .pipe(source('bundle.min.js'))
        .pipe(buffer())
        // .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(DIST.JS));
});

//
// THIS ARE THE IMPORTANT TASKS !!!
//
// WATCH TASK for js and scss
gulp.task ('watch', ['clean', 'js-watch', 'scss-watch']);

// BUILD TASK for js and scss
gulp.task ('build', ['clean', 'js-build', 'scss-build']);

