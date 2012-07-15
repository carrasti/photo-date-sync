requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: 'js/jquery'
    }
});

(function(){
    var libs = ["jquery", "libs/jquery.tmpl", "libs/jquery.mousewheel","libs/jquery.ui.custom"];
    var app = ["app","step1","photohandler"];
    
    var reqs=[];
    reqs.push.apply(reqs,libs);
    reqs.push.apply(reqs,app);
    
    require(reqs, function($) {
        $(function() {
            $(document).ready(function() {
                /*initialize the look of the page*/
                appManager.initStep();
            });
        });
    });
})();


