'use strict';

var gulp = require('gulp');
const fractal = require('./fractal.js');
const logger = fractal.cli.console;
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var sassGlob = require('gulp-sass-glob');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');


// Node Sass se utilizará de forma predeterminada,
// aún así se recomienda que se configure explícitamente
// para mantener una compatibilidad futura en caso de que
// cambie el valor predeterminado.
sass.compiler = require('node-sass');


// Compilar los ficheros SCSS y enviar el CSS resutlante
// en la carpeta /assets/css
gulp.task('sass', function () {
  return gulp.src('src/assets/scss/*.scss')
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/assets/css'));
});


// Optimización del CSS:
// - combinación de los media queries que coinciden (mqpacker)
// - minificación (cssnano)
gulp.task('css-minify', function () {
  var plugins = [
    autoprefixer,
    mqpacker,
    cssnano
  ];
  return gulp.src('assets/css/style.css', {allowEmpty: true})
    .pipe(postcss(plugins))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('assets/css'));
});


// Optimización de las imágenes:
// PNG, JPEG, GIF y SVG
gulp.task('image-minify', function () {
  return gulp.src('src/assets/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('assets/images'));
});


// Copio todos los estáticos: /assets
gulp.task("copy:assets", function () {
  return gulp.src([
    'src/assets/**/*',
    '!src/assets/*{scss,scss/**}',
    '!src/assets/css/*.css.map'
  ])
  .pipe(gulp.dest('./assets/'));
});


// Clean assets
gulp.task('clean:assets', gulp.series('copy:assets'), function () {
  return gulp.src('./assets/', {
    read: false
  }).pipe(clean());
});


// Vigilar si hay algún cambio tanto en los SCSS
// de los componentes como en los de /assets/
gulp.task('watch', function () {
  gulp.watch('src/components/**/*.scss', gulp.series('sass'));
  gulp.watch('src/assets/**/*.scss', gulp.series('sass'));
  gulp.watch('src/assets/img/**/*', gulp.series('image-minify'));
  gulp.watch(['src/assets/**/*', '!src/assets/**{scss,scss/**}'], gulp.series('copy:assets'));
});


// Start the Fractal server
//
// In this example we are passing the option 'sync: true' which means that it will
// use BrowserSync to watch for changes to the filesystem and refresh the browser automatically.
// Obviously this is completely optional!
//
// This task will also log any errors to the console.
gulp.task('fractal:start', function () {
  const server = fractal.web.server({
    sync: true
  });
  server.on('error', err => logger.error(err.message));
  return server.start().then(() => {
    logger.success(`-------------------------------------------`);
    logger.success(`|  Local URL:   ${server.url}     |`);
    logger.success(`|  Network URL: ${server.urls.sync.external}  |`);
    logger.success(`-------------------------------------------`);
  });
});


 // Run a static export of the project web UI.
 //
 // This task will report on progress using the 'progress' event emitted by the
 // builder instance, and log any errors to the terminal.
 //
 // The build destination will be the directory specified in the 'builder.dest'
 // configuration option set above.
gulp.task('fractal:build', function () {
  const builder = fractal.web.builder();
  builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
  builder.on('error', err => logger.error(err.message));
  return builder.build().then(() => {
    logger.success('Fractal build completed!');
  });
});


// Conjunto de tareas a ejectuar
// -------------------------------------------------

// Only Fractal
gulp.task('default', gulp.parallel('fractal:start'));

// Development
gulp.task('dev', gulp.parallel('clean:assets', 'fractal:start', 'css-minify', 'watch', 'sass'));

// Build to share
gulp.task('build', gulp.series('image-minify', 'css-minify', 'fractal:build'));