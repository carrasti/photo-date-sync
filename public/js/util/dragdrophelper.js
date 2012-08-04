define([
        'jquery',
        'underscore',
        'backbone'        
], function($, _, Backbone){
    var DragDropHelper = Backbone.Model.extend({
        initialize : function(opts) {
            this.$el = $(opts.el);
            this.group = opts.model;
            this.view = opts.view;
        },
        onStartDrag : function(event, ui) {
            this.group.dragging = true;
            this.set('width', this.$el.width());
            this.$el.width(this.get('width'));
            this.$el.css('right', '');
        },

        onDrag : function(event, ui) {
            this.updateGroupTsData();
        },

        onEndDrag : function() {
            this.group.recalculatePctsBlock();
            this.$el.width('auto');
            this.group.dragging = false;
        },
        updateGroupTsData : function(end) {
            var newTs = this.getNewTs();
            this.group.set({
                'firstTs' : newTs
            });
        },
        getNewTs:function(){
            var length=this.group.get('timelineLastTs')-this.group.get('timelineFirstTs');
            return Math.floor(this.group.get('timelineFirstTs')+(length*(this.getLeftPct()/100)));
        },
        getLeftPct:function(){
            return (this.$el.position().left/this.$el.parent().width())*100;
        }
    });
    return DragDropHelper;
});