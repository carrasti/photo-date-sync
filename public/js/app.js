$(document).ready(function() {
    /*initialize the look of the page*/
    appManager.initStep();
});

// templates for the page
$.template('tools', '{{each tools}}<li class="${cls}"><span>${text}</span></li>{{/each}}');
$.template('sortPage', '\
    <div class="photos">\
        <div class="cameras"><ul></ul></div>\
        <div class="photo-ct-outer">\
            <div class="photos-ct"></div>\
        </div>\
        <div class="timeadjust"><ul></ul></div>\
    </div>\
    <div class="timeline"></div>\
    <div class="wizardnav"></div>');
$.template('photoRow', '<div class="photostream"><ul></ul></div>');
$.template('photo', '\
    <li class="photostream-image">\
        <span class="image"><img src="data:image/gif;base64,${thumbnail}"></span>\
        <span class="metadata"><span class="name">${name}</span><span class="date">${date}</span></span>\
    </li>');
$.template('camera', '<li class="cameramodel"><span>${camera}</span></li>');
        

/* create a singleton photosync object */
var appManager = {
    initStep : function(index) {
        index = index || 1;

        var step = window['photoSyncStep' + index];
        step.init();
    }
};

