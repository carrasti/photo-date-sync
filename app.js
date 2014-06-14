
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , errorHandler = require('errorhandler')
  , methodOverride = require('method-override')
  , bodyParser = require('body-parser')
  , cons = require('consolidate')
  , nunjucks = require('nunjucks');

var app = express()

// assign the nunjucks engine to .jinjs files
app.engine('jinjs', cons.nunjucks);

// set .jinjs as the default extension
app.set('view engine', 'jinjs');
app.set('views', __dirname + '/views');

nunjucks.configure(__dirname + '/views', {
    autoescape: true
});

// Configuration

app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

// Routes
app.get(/^\/photolist\/?/, routes.photoList);
app.post(/^\/savephotolist\/?/, routes.savePhotos);
app.get(/^\/photo(.*)/, routes.fsList);
app.get('/', routes.index);

app.listen(8001);
