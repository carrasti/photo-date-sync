// templates for the page
$.template('tools', '{{each tools}}<li class="${cls}"><span>${text}</span></li>{{/each}}');
$.template('sortPage', 
'   <div class="photos">'+
'        <div class="cameras"><ul></ul></div>'+
'        <div class="photo-ct-outer">'+
'            <div class="photos-ct"></div>'+
'        </div>'+
'        <div class="timeadjust"><ul></ul></div>'+
'    </div>'+
'    <div class="timeline"></div>'+
'    <div class="wizardnav"></div>');
var a=$.template('photoRow', '<div class="distribute-height photostream"><ul></ul></div>');
$.template('photo',
'    <li class="photostream-image">'+
'        <span class="image"><img src="data:image/gif;base64,${thumbnail}"></span>'+
'        <span class="metadata"><span class="name">${name}</span><span class="date">${date}</span></span>'+
'    </li>');
$.template('camera', '<li class="distribute-height cameramodel"><span>${camera}</span></li>');

$.template('timeadjust',
'        <li class="distribute-height timeadjuster">'+
'            <div class="adjuster-wrapper">'+
'                <span class="plusminus icon icon-plus"></span>'+
'                {{each fields}}'+
'                    <span class="${type}">'+
'                        <span class="value"><label>${name}</label><input type="text" name="${type}" value="59"/></span>'+
'                        <span class="modifiers">'+
'                            <span class="up icon icon-up"></span>'+
'                            <span class="down icon icon-down"></span>'+
'                        </span>'+
'                    </span>'+
'                {{/each}}'+
'            </div>'+
'        </li>');


var TIME = {};
TIME.second=1000;
TIME.minute=TIME.second*60;
TIME.hour=TIME.minute*60;
TIME.day=TIME.hour*24;


var TIME_PRECISION = [
        10*TIME.second, //[0]
        30*TIME.second, //[1]
         1*TIME.minute, //[2]
         3*TIME.minute, //[3]
        10*TIME.minute, //[4]
        30*TIME.minute, //[5]
         1*TIME.hour, //[6]
         3*TIME.hour, //[7]
         9*TIME.hour, //[8]
         1*TIME.day, //[9]
         2*TIME.day, //[10]
         4*TIME.day, //[11]
         7*TIME.day //[12]
];
         

/* create a singleton photosync object */
var appManager = {
    initStep : function(index) {
        index = index || 1;

        var step = window['photoSyncStep' + index];
        step.init();
    }
};

