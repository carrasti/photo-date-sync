define([
        'jquery',
        'underscore',
        'backbone',
        'util/timeutil'
], function($, _, Backbone,TimeUtil){
    var ScaleHelper = Backbone.Model.extend({
        defaults:{
            currentScale:undefined,
            firstTs:0,
            lastTs:0
        },
        initialize : function(opts){
            this.$el=$(opts.el);
            this.$sizeHelper=this.$el.parent().find('.size-helper');
            if (this.$sizeHelper.length===0){
                this.$sizeHelper=this.$el.before('<div class="size-helper"></div>').prev();
                this.$sizeHelper.height(0);
            }
            this.$timedivs=this.$el.parent().find('.time-dividers');
            _.each(TimeUtil.DIVIDERS_ORDER,function(value, index){
                this.$timedivs.append('<div class="'+value+'"></div>');
            },this);
            this.activeDivider1=undefined;
            this.activeDivider2=undefined;
        },
        fitScale:function(firstTs,lastTs){
            firstTs=firstTs||this.get('firstTs');
            lastTs=lastTs||this.get('lastTs');
            this.set('currentScale',TimeUtil.scaleGetBest(firstTs,lastTs));
            this.scale();
        },
        scale:function(scale, scaleDiff, mousePageOffset, animate){
            scaleDiff=scaleDiff || 0;
            scale=scale||(this.get('currentScale')+scaleDiff);
            if (scale<0||scale>TimeUtil.SCALES.length ){
                return;
            }
            var el=this.$el,scroller=el.parent();
            
            //stop the animations and go to the end so that sizes are up to date;
            el.stop(true,true);
            scroller.stop(true,true);
            this.$timedivs.stop(true,true);
            
            //set the value for the scale
            this.set('currentScale',scale);
            
            //calculate sizes in percent and pixels
            var newPct=TimeUtil.getScalePct(scale,this.get('firstTs'),this.get('lastTs'));
            var elNewWidthPct=newPct+'%';
            this.$sizeHelper.width(elNewWidthPct);
            var newWidthPx=this.$sizeHelper.width();
            var oldWidthPx=this.$el.width();
            
            //calculate the position for the scroll based in the page offset or the center of the selection
            var scrollerScrollLeft=scroller.scrollLeft();
            var mouseXFromScroll=mousePageOffset?mousePageOffset-scroller.offset().left+1:scroller.width()/2;
            var scrollXCenter=scrollerScrollLeft+mouseXFromScroll;
            
            
            
            var newCenter=(scrollXCenter*newWidthPx/oldWidthPx);
            var newScrollLeft=Math.max(newCenter-mouseXFromScroll,0);
            
            if (animate===true){
                el.animate({width:elNewWidthPct},200);
                scroller.animate({scrollLeft:newScrollLeft},200);
                this.$timedivs.animate({width:elNewWidthPct},200);
            }else{
                el.width(elNewWidthPct);
                scroller.scrollLeft(newScrollLeft);
                this.$timedivs.width(elNewWidthPct);
            }
            //adjust the dividers
            this.adjustTimeDividers(newScrollLeft,newWidthPx);

        },
        adjustTimeDividers:function(scrollLeft,totalWidth){
            var el=this.$el,scroller=el.parent();
            scrollLeft=scrollLeft||scroller.scrollLeft();
            totalWidth=totalWidth||el.width();
            
            var visibleLength=scroller.width();
            var firstPct=Math.max(0,scrollLeft/totalWidth*100);
            var lastPct=Math.min(100,(scrollLeft+visibleLength)/totalWidth*100);
            var firstTs=this.get('firstTs'),lastTs=this.get('lastTs');
            var visibleFirstTs=TimeUtil.pctCalculateTs(firstPct,firstTs,lastTs);
            var visibleLastTs=TimeUtil.pctCalculateTs(lastPct,firstTs,lastTs);
            
            var tsDistance=visibleLastTs-visibleFirstTs;
            
            var drawFirstTs=Math.max(firstTs,visibleFirstTs-tsDistance);
            var drawLastTs=Math.min(lastTs,visibleLastTs+tsDistance);
            this.drawDividers(TimeUtil.dividersGetBest(visibleFirstTs,visibleLastTs),drawFirstTs,drawLastTs);
        },
        drawDividers:function(type,firstTs,lastTs){
            var actives=this.$timedivs.find('.active');
            if (actives.length>2){
                actives.removeClass('active').removeClass('next').html('');
                this.activeDivider1=undefined;
                this.activeDivider2=undefined;
            }
            var nextType=undefined;
            if (type!=_.last(TimeUtil.DIVIDERS_ORDER)){
                nextType=TimeUtil.DIVIDERS_ORDER[_.indexOf(TimeUtil.DIVIDERS_ORDER,type)+1];
            }
            if(!this.activeDivider1 || this.activeDivider1.length===0 || !this.activeDivider1.hasClass(type)){
                if (this.activeDivider1 && this.activeDivider1>0){
                    this.activeDivider1.removeClass('active').removeClass('next').html('');
                }
                this.activeDivider1=this.$timedivs.find('.'+type);
                this.activeDivider1.addClass('active');
            }
            
            if (!nextType && this.activeDivider2 && this.activeDivider2.length>0 && this.activeDivider2[0]!=this.activeDivider1[0]){
                this.activeDivider2.removeClass('active').removeClass('next').html('');
                this.activeDivider2=undefined;
            }else if(nextType && (!this.activeDivider2 || this.activeDivider2.length===0 || !this.activeDivider2.hasClass(nextType))){
                if (this.activeDivider2 && this.activeDivider2.length>0){
                    this.activeDivider2.removeClass('next');
                    if(this.activeDivider2[0]!=this.activeDivider1[0]){
                        this.activeDivider2.removeClass('active').html('');
                    }
                }
                this.activeDivider2=this.$timedivs.find('.'+nextType);
                this.activeDivider2.addClass('active next');
            }

            this.updateDividers(type,nextType,firstTs,lastTs);
        },
        updateDividers:function(type,nextType,firstTs,lastTs){
            var timeLength=TimeUtil.DIVIDERS[type];
            var firstDrawTs=firstTs-firstTs%timeLength;
            var ts=firstDrawTs;
            var el=this.activeDivider1;
            var tlFirstTs=this.get('firstTs'),tlLastTs=this.get('lastTs');
            while(ts<lastTs){
                var id='divider-'+type+'-'+ts;
                if (el.find('#'+id).length===0){
                    var pct=TimeUtil.tsCalculatePct(ts,tlFirstTs,tlLastTs);
                    el.append('<div id="'+id+'" class="divider" style="left:'+pct+'%"><span class="timestring">'+TimeUtil.tsDividerToStr(type,ts)+'</span></div>');
                }
                ts+=timeLength;
            }
            if (!nextType){
                return;
            }
            var timeLength2=TimeUtil.DIVIDERS[nextType];
            firstDrawTs=firstTs-firstTs%timeLength2;
            ts=firstDrawTs;
            el=this.activeDivider2;
            while(ts<lastTs){
                if (ts%timeLength!==0){
                    var id='divider-'+type+'-'+ts;
                    if (el.find('#'+id).length===0){
                        var pct=TimeUtil.tsCalculatePct(ts,tlFirstTs,tlLastTs);
                        el.append('<div id="'+id+'" class="divider" style="left:'+pct+'%"><span class="timestring">'+TimeUtil.tsDividerToStr(nextType,ts)+'</span></div>');
                    }
                }
                ts+=timeLength2;
            }
            
            
        }
    });
    return ScaleHelper;
});