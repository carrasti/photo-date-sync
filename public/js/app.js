$(document).ready(function(){
     appManager.initStep();
});

/* create a singleton photosync object */
var appManager={
    initStep:function(index){
        index = index || 1;
        
        var step=window['photoSyncStep'+index];
        step.init();
    }
};


