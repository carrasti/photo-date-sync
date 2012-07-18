// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
    'jquery': 'libs/jquery/jquery',
    'jquery.mousewheel': 'libs/jquery/jquery.mousewheel',
    'jquery.tmpl': 'libs/jquery/jquery.tmpl',
    'jquery.ui.custom': 'libs/jquery/jquery.ui.custom',
    'underscore': 'libs/underscore/underscore-min',
    'backbone': 'libs/backbone/backbone-min',
    'text': 'libs/require/text',
    'domready': 'libs/require/domReady'
  },
  shim:{
      'underscore':{
          exports: '_'
      },
      'backbone':{
          deps: ['underscore','jquery'],
          exports: 'Backbone'
      },
      'jquery.mousewheel':['jquery'],
      'jquery.tmpl':['jquery'],
      'jquery.ui.custom':['jquery']
  }
});

require(['domready!','jquery','underscore','backbone','views/app'], function(doc,$,_,Backbone,AppView){
    var app=new AppView();
});
