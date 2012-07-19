define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/photogroup-timeadjust.html'
  ], function($, _, Backbone,TimeAdjustTemplate){
  var TimeAdjusterView = Backbone.View.extend({
      tagName:'li',
      className:'distribute-height timeadjuster',
      tpl: _.template(TimeAdjustTemplate),
      initialize:function(){
          //bindings
          this.model.on('change:firstTs change:originalFirstTs',this.onModelChangeTs,this);
      },

      render:function(){
          this.$el.html(this.tpl({}));
          return this;
      },
      onModelChangeTs:function(photoGroup){
          //throttle?
          //console.debug('onModelChangedAnyTs',arguments);
      }
  });
  return TimeAdjusterView ;
});
