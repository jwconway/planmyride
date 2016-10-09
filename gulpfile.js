/// <binding ProjectOpened='default' />
"use strict";
// When adding a new npm module try and add it to the task where it is used.
// This will allow gulp to run npm install before the newly added module is referenced.
var gulp = require("gulp")
    , path = require("path")
    , requireDir = require('require-dir')
    , less = require('gulp-less')
    , minifyCss = require('gulp-minify-css')
    , concatCss = require('gulp-concat-css')
    , rename = require('gulp-rename')
    , runSequence = require('run-sequence')
    , cache = require('gulp-cached')
    , newer = require('gulp-newer')
    , gulpIf = require('gulp-if')
    , sourcemaps = require("gulp-sourcemaps")
    , concat = require("gulp-concat-js")
    , uglify = require('gulp-uglify')
    , minify = require('gulp-minify')
    , pump = require('pump')
    , inject = require('gulp-inject')
    , series = require('stream-series');

var interval = 1000;
var appPath = 'app';
var distPath = 'dist';

gulp.task('default', ['watch']);

gulp.task('build', function(){
    return runSequence(['copy-js', 'copy-css', 'copy-views'], 'inject');
});

gulp.task("copy-js", function () {
    return pump([
        gulp.src([
            './**/bower_components/angular/angular.min.js',
            './**/bower_components/angular-route/angular-route.min.js',
            './**/bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js',
            'app/*.{js,json}',
            'app/**/*.{js,json}'
        ]),
        uglify(),
        //minify(),
        gulp.dest('dist')
    ]);
});

gulp.task('copy-css', function(){
    return pump([
        gulp.src([
            './bower_components/**/html5-boilerplate/dist/css/normalize.css',
            './bower_components/**/html5-boilerplate/dist/css/main.css',
            'app/**/*.{less,css}'
        ]),
        less(),
        concatCss('/css/app.css', { rebaseUrls: false }),
        minifyCss(),
        gulp.dest(distPath)
    ]);
});

gulp.task('copy-views', function(){
   return pump([
       gulp.src(['app/*.{html,htm}', 'app/**/*.{html,htm}']),
        gulp.dest(distPath)
    ]); 
});

gulp.task('inject', function(){
    
    var angularStream = gulp.src('./dist/bower_components/angular/angular.min.js');
    var angularRouteStream = gulp.src('./dist/bower_components/angular-route/angular-route.min.js');
    var modenizrStream = gulp.src('./dist/bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js');
    var cssStream = gulp.src('./dist/**/*.{less,css}');
    var appScriptsStream = gulp.src(['./dist/**/*.{js,json}', '!./dist/**/bower_components/**']);
    
    return pump([
        gulp.src('./dist/index.html'),
        inject(series(angularStream, angularRouteStream, modenizrStream, cssStream, appScriptsStream), { addRootSlash : false, relative: true }),
        gulp.dest('./dist')    
    ]);
});

gulp.task('watch', function(){
    return gulp.watch(['./app/**/*.*'], { interval: interval }, ['build']);
});

