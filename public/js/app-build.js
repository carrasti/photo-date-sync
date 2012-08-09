({
   //appDir: "../",
   baseUrl: "./",
   //dir: "../../dist",
   out:'main-built.js',
   name:'main',
   //modules: [
   //     {
   //         name: "main"
   //     }
    //],
    paths: {
       // libraries path
        'jquery': 'libs/jquery/jquery',
        'jquery.mousewheel': 'libs/jquery/jquery.mousewheel',
        'jquery.tmpl': 'libs/jquery/jquery.tmpl',
        'jquery.ui.custom': 'libs/jquery/jquery.ui.custom',
        'underscore': 'libs/underscore/underscore-min',
        'backbone': 'libs/backbone/backbone-min',
        

       // require plugins
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
})