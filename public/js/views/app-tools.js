define([
        'jquery',
        'underscore',
        'backbone',
        'collections/tools',
        'views/tool',
], function($, _, Backbone, Tools, ToolView) {
    var AppTools = Backbone.View.extend({
        el : $('header .tools ul'),
        initialize : function() {
            this.collection.bind('add', this.addOne, this);
            this.collection.bind('remove',this.removeOne,this);
            this.collection.bind('reset',this.removeAll,this);
        },
        addOne : function(model) {
            var view = new ToolView({
                model : model
            });
            this.$el.append(view.render().el);
        },
        removeAll:function(){
            this.$el.html('');
        },
        removeOne:function(model){
            model.trigger('removed_from_collection',model);
        }
    });
    return AppTools;
});
