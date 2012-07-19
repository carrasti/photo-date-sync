define(['jquery','backbone','underscore','models/photo'],function($,Backbone,_,Photo){
    var Photos=Backbone.Collection.extend({
        model:Photo,
        comparator:function(photo){
            return photo.getTs();
        }
    });
    return Photos;
});
