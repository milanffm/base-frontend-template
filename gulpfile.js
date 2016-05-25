'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');
var neat = require('node-neat');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var assign = require('lodash').assign;

var TASKS = {
    WATCH: 'watch',
    BUILD: 'build',
    CLEAN: 'clean',
    JS: {
        WATCH : 'js-watch',
        BUILD: 'js-build',
        POLYFILL_BUILD : 'js-build-polyfills'
    },
    CSS : {
        DEFAULT: 'scss',
        WATCH: 'scss_watch',
        BUILD: 'scss_build'
    }
};

var DIST = {
    CSS : './dist/css',
    JS : './dist/js',
    JS_FILE : 'bundle.js',
    JS_FILE_MIN: 'bundle.min.js',
    JS_FILE_POLYFILLS_MIN: 'polyfills.min.js'
};

var SRC = {
    SCSS : './src/scss/**/*.scss',
    JS_START : './src/js/app.js',
    JS_POLYFILLS: './src/js/polyfills.js'
};

// add custom browserify options here
var customOpts = {
    entries: [SRC.JS_START],
    debug: true
};

var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task(TASKS.JS.WATCH, jsWatchBundle); // so you can run `gulp js` to build the file
b.on('update', jsWatchBundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function jsWatchBundle() {
    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source(DIST.JS_FILE))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest(DIST.JS));
}

//Create the build tasks:
gulpBrowserifyBuild(TASKS.JS.BUILD, SRC.JS_START, DIST.JS_FILE_MIN, DIST.JS);
gulpBrowserifyBuild(TASKS.JS.POLYFILL_BUILD, SRC.JS_POLYFILLS, DIST.JS_FILE_POLYFILLS_MIN, DIST.JS);

function gulpBrowserifyBuild(TASK, SRC, DIST_FILE, DIST_DEST) {

    gulp.task(TASK, function () {
        // set up the browserify instance on a task basis
        var b = browserify({
            entries: SRC,
            debug: true
        });

        return b.bundle()
            .pipe(source(DIST_FILE))
            .pipe(buffer())
            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(gulp.dest(DIST_DEST));
    });

}

// ================ CSS TASKS =================

gulp.task(TASKS.CSS.DEFAULT, function () {
    return gulp.src(SRC.SCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-neat').with('node-bourbon')
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(DIST.CSS));
});

gulp.task(TASKS.CSS.BUILD, function () {
    return gulp.src(SRC.SCSS)
        .pipe(sass({
            includePaths: require('node-neat').with('node-bourbon')
        }).on('error', sass.logError))
        .pipe(gulp.dest(DIST.CSS));
});

gulp.task(TASKS.CSS.WATCH, function () {
    gulp.watch(SRC.SCSS, [TASKS.CSS.DEFAULT]);
});

// ================ CSS TASKS END =================


// ================ CLEAR TASK  =================

gulp.task(TASKS.CLEAN, function () {
    return del( [DIST.JS, DIST.CSS], {force: true} );
});

// ================  THIS ARE THE IMPORTANT TASKS !!! ================

// WATCH TASK for js and scss
gulp.task (TASKS.WATCH, [TASKS.CLEAN, TASKS.JS.WATCH, TASKS.CSS.WATCH]);

// BUILD TASK for js and scss
gulp.task (TASKS.BUILD, [TASKS.CLEAN, TASKS.JS.POLYFILL_BUILD, TASKS.JS.BUILD, TASKS.CSS.BUILD]);

// ==================================================================== 