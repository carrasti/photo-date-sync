define([
  'jquery',
  'underscore',
  'backbone',
  'util/timeutil',
  'text!templates/photogroup-timeadjust.html'
  ], function($, _, Backbone,TimeUtil,TimeAdjustTemplate){
  var TimeAdjusterView = Backbone.View.extend({
      tagName:'li',
      className:'distribute-height timeadjuster',
      tpl: _.template(TimeAdjustTemplate),
      initialize:function(){
          //bindings
          this.throttledOnModelChangeTs=_.throttle(this.onModelChangeTs,50);
          this.model.on('change:firstTs change:originalFirstTs',this.throttledOnModelChangeTs,this);
      },
      events:{
          'click .modifiers > span':'onModifierClick'
      },
      render:function(){
          this.$el.html(this.tpl({}));
          /* initialize the elements */
          this.elPlusMinus=this.$el.find('.plusminus');
          this.elDay=this.$el.find('.day');
          this.elHour=this.$el.find('.hour');
          this.elMin=this.$el.find('.min');
          this.elSec=this.$el.find('.sec');
          return this;
      },
      onModelChangeTs:function(photoGroup){
          var diff=this.model.get('firstTs')-this.model.get('originalFirstTs');
          var timeParts=TimeUtil.tsGetParts(Math.abs(diff));

          this.elDay.find('input').val(timeParts.days);
          this.elHour.find('input').val(timeParts.hours);
          this.elMin.find('input').val(timeParts.minutes);
          this.elSec.find('input').val(timeParts.seconds);

          this.elPlusMinus.removeClass('icon-plus');
          this.elPlusMinus.removeClass('icon-minus');
          if (diff>0){
              this.elPlusMinus.addClass('icon-plus');
          }else if (diff<0){
              this.elPlusMinus.addClass('icon-minus');
          }
      },
      onModifierClick:function(event){
          var target=event.target,me=this;
          var modifierType=$(target).parent().parent()[0].className;
          var diff=$(target).hasClass('up')?1:-1;
          var newTs=me.model.get('firstTs');

          switch(modifierType){
              case 'day':
                  newTs=TimeUtil.tsAddDays(newTs,diff);
                  break;
              case 'hour':
                  newTs=TimeUtil.tsAddHours(newTs,diff);
                  break;
              case 'min':
                  newTs=TimeUtil.tsAddMinutes(newTs,diff);
                  break;
              case 'sec':
                  newTs=TimeUtil.tsAddSeconds(newTs,diff);
                  break;
          }

          me.model.set('firstTs',newTs);
          me.model.recalculatePctsBlock();
      }
  });
  return TimeAdjusterView ;
});
