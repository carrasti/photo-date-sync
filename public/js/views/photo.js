define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/photo.html'
  ], function($, _, Backbone,PhotoTemplate){
  var PhotoView = Backbone.View.extend({
      tagName:'li',
      className:'photostream-image',
      tpl:_.template(PhotoTemplate),
      
      initialize:function(){
          //bindings
          this.model.on('change:groupPct',this.onGroupPctChange,this);
      },

      render:function(){
          $(this.el).html(this.tpl(this.model.toJSON()));
          return this;
      },
      onGroupPctChange:function(photo,pct){
          this.$el.css('left',pct+'%');
      }
  });
  return PhotoView;
});
