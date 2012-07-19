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
