'use strict';

/* Create a new Fractal instance and export it for use elsewhere if required */
const fractal = module.exports = require('@frctl/fractal').create();

/* Set the title of the project */
fractal.set('project.title', 'Fractal listo para usar - Pattern Library');

/* Tell Fractal where the components will live */
fractal.components.set('path', __dirname + '/src/components');

/* Tell Fractal default preview layout */
fractal.components.set('default.preview', '@preview');

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', __dirname + '/src/docs');

// Tell Fractal where static files will live
fractal.web.set('static.path', __dirname + '/assets');

// Prefix the URL path of the assets
// fractal.web.set('static.mount', 'assets');

// Tell Fractal where build destination will live
fractal.web.set('builder.dest', __dirname + '/build');
