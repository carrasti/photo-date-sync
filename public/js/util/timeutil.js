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
            }

    };
    return TimeUtil;
});
