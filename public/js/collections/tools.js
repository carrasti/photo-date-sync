define(['jquery','backbone','underscore','models/tool'],function($,Backbone,_,Tool){
    var Tools=Backbone.Collection.extend({
        model:Tool
    });
    return Tools;
});