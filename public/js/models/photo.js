define([
        'jquery',
        'backbone',
        'underscore',
        'util/timeutil'
        
        
], function($, Backbone, _,TimeUtil) {

    var Photo = Backbone.Model.extend({
        defaults : {
            thumbnail : '',
            date : null,
            name : 'no_name',
            cameraBrand : 'No camera',
            cameraModel : 'No model',
            model : 'No model',
            pct : 0,
            groupPct:0
        },
        getCameraName : function() {
            return [
                    this.get('cameraBrand'),
                    this.get('cameraModel')
            ].join(' ');
        },
        getTs : function() {
            return this.has('date') ? this.get('date').getTime() : 0;
        },
        toJSON:function(){
            return _.extend(Backbone.Model.prototype.toJSON.apply(this,arguments),{
                timestr : TimeUtil.tsDividerToStr('minutes',this.getTs())
            });
            
        }
    });
    return Photo;
});
