
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jinjs');
  app.set("view options", { jinjs_pre_compile: function (str) { return parse_pwilang(str); } });
  app.set("view options", { layout: false} );
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get(/^\/photolist\/?/, routes.photoList);
app.post(/^\/savephotolist\/?/, routes.savePhotos);
app.get(/^\/photo(.*)/, routes.fsList);
app.get('/', routes.index);



app.listen(8001, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
