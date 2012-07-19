define([
  'jquery',
  'underscore',
  'backbone',
  'models/tool',
  'text!templates/tool.html',
  ], function($, _, Backbone,Tool, ToolTpl){
  var ToolView = Backbone.View.extend({
      tagName:'li',
      tpl: _.template(ToolTpl),

      constructor:function(opts){
          this.className=opts.model.get('cls');
          Backbone.View.prototype.constructor.apply(this,arguments);
      },

      initialize:function(options){
          this.model.on('change',this.render, this);
          this.model.on('removed_from_collection',this.remove, this);
      },

      render:function(){
          this.$el.html(this.tpl(this.model.toJSON()));
          return this;
      },
  });
  return ToolView;
});
