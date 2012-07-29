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
          'click .modifiers > span':'onModifierClick',
          'click span.plusminus':'onPlusMinusClick'
      },
      render:function(){
          this.$el.html(this.tpl({}));
          /* initialize the elements */
          this.elPlusMinus=this.$el.find('.plusminus');
          this.elDay=this.$el.find('.days');
          this.elHour=this.$el.find('.hours');
          this.elMin=this.$el.find('.mins');
          this.elSec=this.$el.find('.secs');
          return this;
      },
      onModelChangeTs:function(photoGroup){
          this.updateInputs();
      },
      updateInputs:function(){
          var diff=this.model.get('firstTs')-this.model.get('originalFirstTs');
          var timeParts=TimeUtil.tsGetParts(Math.abs(diff));

          this.elDay.find('span.number').html(timeParts.days);
          this.elHour.find('span.number').html(timeParts.hours);
          this.elMin.find('span.number').html(timeParts.minutes);
          this.elSec.find('span.number').html(timeParts.seconds);

          this.elPlusMinus.removeClass('icon-plus');
          this.elPlusMinus.removeClass('icon-minus');
          if (diff>0){
              this.elPlusMinus.addClass('icon-plus');
          }else if (diff<0){
              this.elPlusMinus.addClass('icon-minus');
          }
      },
      onModifierClick:function(event){
          var target=event.target;
          var modifierType=$(target).parent().parent()[0].className;
          var diff=$(target).hasClass('up')?1:-1;
          var newTs=this.model.get('firstTs');

          switch(modifierType){
              case 'days':
                  newTs=TimeUtil.tsAddDays(newTs,diff);
                  break;
              case 'hours':
                  newTs=TimeUtil.tsAddHours(newTs,diff);
                  break;
              case 'mins':
                  newTs=TimeUtil.tsAddMinutes(newTs,diff);
                  break;
              case 'secs':
                  newTs=TimeUtil.tsAddSeconds(newTs,diff);
                  break;
          }

          this.model.set('firstTs',newTs);
          this.model.recalculatePctsBlock();
      },
      onPlusMinusClick:function(){
          this.model.set('firstTs',this.model.get('originalFirstTs'));
          this.model.recalculatePctsBlock();
      }
  });
  return TimeAdjusterView ;
});
