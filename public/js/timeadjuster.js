

var PhotoSync=window.PhotoSync||{};

PhotoSync.TimeStampUtil=(function(TimeUtil){
    var second=1000;
    var minute=60*second;
    var hour=60*minute;
    var day=24*hour;
    
    $.extend(TimeUtil,{
        SECOND:second,
        MINUTE:minute,
        HOUR:hour,
        DAY:day,
        
        addSeconds:function(ts,seconds){
            return (ts+(PhotoSync.TimeStampUtil.SECOND*seconds));
        },
        addMinutes:function(ts,minutes){
            return (ts+(PhotoSync.TimeStampUtil.MINUTE*minutes));
        },
        addHours:function(ts,hours){
            return (ts+(PhotoSync.TimeStampUtil.HOUR*hours));
        },
        addDays:function(ts,days){
            return (ts+(PhotoSync.TimeStampUtil.DAY*days));
        },
        getParts:function(ts){
            var tsValue=ts;
            
            var days=Math.floor(tsValue/PhotoSync.TimeStampUtil.DAY);
            tsValue=tsValue-(days*PhotoSync.TimeStampUtil.DAY);
            var hours=Math.floor(tsValue/PhotoSync.TimeStampUtil.HOUR);
            tsValue=tsValue-(hours*PhotoSync.TimeStampUtil.HOUR);
            var minutes=Math.floor(tsValue/PhotoSync.TimeStampUtil.MINUTE);
            tsValue=tsValue-(minutes*PhotoSync.TimeStampUtil.MINUTE);
            var seconds=Math.floor(tsValue/PhotoSync.TimeStampUtil.SECOND);
            
            return{
                'seconds':seconds,
                'minutes':minutes,
                'hours':hours,
                'days':days
            };
        }
    });
    
    
    return TimeUtil;
}(PhotoSync.TimeStampUtil||{}));
        


PhotoSync.TimeAdjuster=(function(PhotoSync){
    PhotoSync.TimeAdjuster = function(parentEl,ts,opts){
        opts=opts||{};
        
        this.parentEl=parentEl;
        this.originalTs=ts;
        this.ts=ts;
        
        $.extend(this,opts);
        
        /*generate item map*/
        var itemsMap={};
        $.each(this.items,function(index,it){
            itemsMap[it.type]=it;
        });
        this.itemsMap=itemsMap;
        
        this.render();
    };
    
    $.extend(PhotoSync.TimeAdjuster.prototype,{
        items:[
               {type:'day', name:'days'},
               {type:'hour', name:'hours'},
               {type:'min', name:'minutes'},
               {type:'sec', name:'seconds'}
         ],
        
        
        tpl:'<li class="distribute-height timeadjuster">'+
        '            <div class="adjuster-wrapper">'+
        '                <span class="plusminus icon"></span>'+
        '                {{each fields}}'+
        '                    <span class="${type}">'+
        '                        <span class="value"><label>${name}</label><input type="text" name="${type}" value="0"/></span>'+
        '                        <span class="modifiers">'+
        '                            <span class="up icon icon-up"></span>'+
        '                            <span class="down icon icon-down"></span>'+
        '                        </span>'+
        '                    </span>'+
        '                {{/each}}'+
        '            </div>'+
        '        </li>',
        render:function(){
            this.el=$.tmpl(this.tpl,{
                fields : [
                          {type:'day', name:'days'},
                          {type:'hour', name:'hours'},
                          {type:'min', name:'minutes'},
                          {type:'sec', name:'seconds'}
                     ]
                 }).appendTo(this.parentEl);
            
            /* initialize the elements */
            this.elPlusMinus=this.el.find('.plusminus');
            this.elDay=this.el.find('.day');
            this.elHour=this.el.find('.hour');
            this.elMin=this.el.find('.min');
            this.elSec=this.el.find('.sec');
            
            /* initialize listeners */
            this.initListeners();
        },
        initListeners:function(){
            this.el.delegate('.modifiers > span','click',{scope:this},this.onModifierClick);
            this.elPlusMinus.on('click',{scope:this},this.onPlusminusClick);
        },
        
        resetTimeStamp:function(triggerEvent){
            this.setTs(this.originalTs,triggerEvent);
        },
        onPlusminusClick:function(event){
            var me=event.data.scope;
            me.resetTimeStamp(true);
        },
        
        onModifierClick:function(event){
            var target=event.target,me=event.data.scope;
            var modifierType=$(target).parent().parent()[0].className;
            var diff=$(target).hasClass('up')?1:-1;
            var newTs=me.ts;

            switch(modifierType){
                case 'day':
                    newTs=PhotoSync.TimeStampUtil.addDays(me.ts,diff);
                    break;
                case 'hour':
                    newTs=PhotoSync.TimeStampUtil.addHours(me.ts,diff);
                    break;
                case 'min':
                    newTs=PhotoSync.TimeStampUtil.addMinutes(me.ts,diff);
                    break;
                case 'sec':
                    newTs=PhotoSync.TimeStampUtil.addSeconds(me.ts,diff);
                    break;
            }
            
            me.setTs(newTs,true);
        },
        setTs:function(ts,triggerEvent){
            triggerEvent=triggerEvent||false;
            
            this.ts=ts;
            this.updateTsValues();
            if (triggerEvent){
                $(this).trigger('changed_ts',[this,this.ts]);
            }
        },
        updateTsValues:function(){
            
            var diff=this.ts-this.originalTs;
            var timeParts=PhotoSync.TimeStampUtil.getParts(Math.abs(diff));
            
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
        }
        
        
    });
    
    return PhotoSync.TimeAdjuster;
}(PhotoSync));

