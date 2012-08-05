define(function(){
    var second=1000;
    var minute=60*second;
    var hour=60*minute;
    var day=24*hour;

    var TimeUtil={
            SECOND:second,
            MINUTE:minute,
            HOUR:hour,
            DAY:day,
            
            
            SCALES : [
                    10*second, //[0]
                    30*second, //[1]
                     1*minute, //[2]
                     3*minute, //[3]
                    10*minute, //[4]
                    30*minute, //[5]
                     1*hour,   //[6]
                     3*hour,   //[7]
                     9*hour,   //[8]
                     1*day,    //[9]
                     2*day,    //[10]
                     3*day,    //[11]
                     4*day,    //[12]
                     5*day,    //[13]
                     6*day,    //[14]
                     7*day     //[15]
            ],

            scaleGetBest:function(startTs,endTs){
                var diff=endTs-startTs;
                var i;
                for (i=1;i<this.SCALES.length;i++){
                    var it=this.SCALES[i-1],next=this.SCALES[i];
                    if (diff>it && diff<next){
                        break;
                    }
                }

                return i;
            },
            dividersGetBest:function(startTs,endtTs){
                var length=endtTs-startTs;
                var best='days',max=0;
                _.each(this.DIVIDERS,function(value,key){
                    var fits=length/value;
                    if (fits<5 && fits>max){
                        max=fits;
                        best=key;
                    }
                });
                return best;
            },

            getScalePct:function(scale,startTs,endTs){
                var diff=endTs-startTs;
                return (diff/this.SCALES[scale])*100;
            },

            tsAddSeconds:function(ts,seconds){
                return (ts+(this.SECOND*seconds));
            },
            tsAddMinutes:function(ts,minutes){
                return (ts+(this.MINUTE*minutes));
            },
            tsAddHours:function(ts,hours){
                return (ts+(this.HOUR*hours));
            },
            tsAddDays:function(ts,days){
                return (ts+(this.DAY*days));
            },
            tsGetParts:function(ts){
                var tsValue=ts;

                var days=Math.floor(tsValue/this.DAY);
                tsValue=tsValue-(days*this.DAY);
                var hours=Math.floor(tsValue/this.HOUR);
                tsValue=tsValue-(hours*this.HOUR);
                var minutes=Math.floor(tsValue/this.MINUTE);
                tsValue=tsValue-(minutes*this.MINUTE);
                var seconds=Math.floor(tsValue/this.SECOND);

                return{
                    'seconds':seconds,
                    'minutes':minutes,
                    'hours':hours,
                    'days':days
                };
            },
            tsCalculatePct : function(ts, tsStart, tsEnd) {
                var length = tsEnd - tsStart;
                var zeroed = ts - tsStart;
                return (zeroed / length) * 100;
            },
            pctCalculateTs : function(pct, tsStart,tsEnd){
                var length = tsEnd - tsStart;
                return tsStart+ (pct/100*length);
            },
            tsDividerToStr:function(type,ts){
                var d=new Date(ts);
                var z=this.zeropad;                
                
                var date=d.getDate()+' '+this.MONTHS_SHORT[d.getMonth()]+' '+ d.getFullYear();
                var min=z(d.getMinutes()+''),hour=z(d.getHours()+''),secs=z(d.getSeconds()+'');
                
                var dateHours=date+' '+hour+':'+min,dateSecs=dateHours+':'+secs;
                
                
                
                switch(type){
                    case 'days':
                        return date;
                    break;
                    case 'halfdays':
                    case 'hours':
                        return '<span class="primary">'+dateHours+'</span><span class="secondary">'+d.getHours()+'h</span>';
                        break;
                    case 'halfhours':
                    case 'quarterhours':
                    case 'minutes':
                        return '<span class="primary">'+dateHours+'</span><span class="secondary">'+d.getMinutes()+'m</span>';
                        break;
                    case 'halfminutes':
                    case 'seconds':
                        return '<span class="primary">'+dateSecs+'</span><span class="secondary">'+d.getSeconds()+'s</span>';
                        break;
                }
            },
            zeropad:function(num){
                num=num+'';
                return num.length==1?'0'+num:num;
            },
            parseExifDate:function(dateStr){
                var parts = dateStr.match(/(\d+):(\d+):(\d+) (\d+):(\d+):(\d+)/);
                return new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10));
            },
            generateExifDate:function(date){
                var z=this.zeropad;
                return date.getFullYear()+':'+z(date.getMonth()+1)+':'+z(date.getDate())+' '+z(date.getHours())+':'+z(date.getMinutes())+':'+z(date.getSeconds());
            }
        };
    TimeUtil.MONTHS_SHORT=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    TimeUtil.DIVIDERS_ORDER=['days','halfdays','hours','halfhours','quarterhours','minutes','halfminutes','seconds'];
    TimeUtil.DIVIDERS={
            'days': TimeUtil.DAY,
            'halfdays': TimeUtil.DAY/2,
            'hours': TimeUtil.HOUR,
            'halfhours':TimeUtil.HOUR/2,
            'quarterhours':TimeUtil.HOUR/4,
            'minutes':TimeUtil.MINUTE,
            'halfminutes':TimeUtil.MINUTE/2,
            'seconds':TimeUtil.SECOND
    };
    
    var ts=10*second;
    TimeUtil.SCALES=[];
    while(ts<7*day){
        TimeUtil.SCALES.push(ts);
        ts*=2;
    }
    
    
    TimeUtil.TS_OFFSET=(new Date()).getTimezoneOffset()*TimeUtil.MINUTE;
    return TimeUtil;
});
