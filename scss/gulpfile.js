var __colors       = require('colors');
var __gulp         = require("gulp");
var __autoprefixer = require("autoprefixer");
var __rename       = require("gulp-rename");
var __sass         = require("gulp-sass")(require('sass'));
var __debug        = require("gulp-debug");
var __cssMinify    = require("gulp-cssmin");
var __media        = require("gulp-group-css-media-queries");
var __postcss      = require("gulp-postcss");
var __pie          = require("postcss-pie");
var __fixes        = require("postcss-fixes");
var __browserSync  = require("browser-sync").create();

//////////////////////////////////////////////////

//Папко где SCSS
const SCSS_WATCH_DIR = 'core/';
const SCSS_MAIN_FILE = (SCSS_WATCH_DIR + 'style.scss');

//Папко где CSS
const SCSS_OUTPUT_DIR = "../css/";

//Корневая папка
const PUBLIC_DIR = '../';

///////////////////////////////////////////////////

function createErrorFunc(prefix){
    return ({formatted}) => {
        console.log(
            (
                "------"      +
                "\n"          +
                prefix        +
                ": "          +
                formatted +
                "\n"          +
                "------"
            ).red
        );
        this.end();
    }
}

function compileScss(path, out){

    var input  = __gulp.src(path),
        output = __gulp.dest(out);

    var
        option_sass       = __sass({}),
        option_autoprefix = __autoprefixer({
            overrideBrowserslist : [
                "Chrome >= 25",
                "Firefox >= 5",
                "iOS >= 8",
                "Opera >= 26",
                "Explorer >= 8"
            ],
            cascade : false
        }),
        option_pie        = __pie,
        option_fixes      = __fixes,
        option_debug   = __debug({ title : "Completed: " }),
        option_errno   = createErrorFunc("SCSS_ERR"),
        option_media   = __media(),
        option_minify  = __cssMinify(),
        option_postcss = __postcss([option_pie, option_fixes, option_autoprefix])
    ;

    return input
        .pipe(option_sass)
        .on("error", option_errno)
        .pipe(option_media)
        .pipe(option_postcss)
        .pipe(option_minify)
        .pipe(option_debug)
        .pipe(output);


}

function watchScss(handler){
    __gulp.watch(SCSS_WATCH_DIR + "**/*.scss").on("change", (path) => {
        compileScss(SCSS_MAIN_FILE, SCSS_OUTPUT_DIR);
        handler && handler();
    });

    compileScss(SCSS_MAIN_FILE, SCSS_OUTPUT_DIR);
}

////////////////////////////////////////////////////
exports.build = __gulp.series(next => {
    compileScss(SCSS_MAIN_FILE, SCSS_OUTPUT_DIR);
    next();
});

exports.watch = __gulp.series(next => {
   watchScss();
   next();
});

exports.serve = __gulp.parallel(
    next => {
        watchScss(() => __browserSync.reload());
        next();
    },
    next => {

        __browserSync.init({
            server: {
                baseDir: PUBLIC_DIR
            },
            port: 3000
        });

        next();

    }
);

//////////////////////////////////////////////////////


