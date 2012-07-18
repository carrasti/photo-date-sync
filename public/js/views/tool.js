define([
  'jquery',
  'underscore',
  'backbone',
  'models/tool',
  'text!templates/tool.html',
  ], function($, _, Backbone,Tool, ToolTpl){
  var ToolView = Backbone.View.extend({

      tpl: _.template(ToolTpl),

      initialize:function(){
          this.model.bind('change',this.render, this);
          this.model.bind('removed_from_collection',this.remove, this);
      },

      render:function(){
          this.$el.html(this.tpl(this.model.toJSON()));
          return this;
      },
  });
  return ToolView;
});
