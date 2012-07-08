var PhotoHandler=function(options){
    options=options||{};
    this.photos=[];
    this.photosByCamera={};
    this.removedPhotos=[];
    
    // default 10 minutes margin right left;
    this.timeMargin=options.timeMargin||600000;
    this.timelineLength=undefined;
    this.timelineFirst=undefined;
    this.timelineLast=undefined;
};

PhotoHandler.prototype.addPhoto=function(data){
    this.photos.push(data);
    var camera = data.camera + ' ' + data.model;
    if (!this.photosByCamera.hasOwnProperty(camera)) {
        this.photosByCamera[camera] = [];
    }
    this.photosByCamera[camera].push(data);
};

PhotoHandler.prototype.sortByDate=function(){
    var fn=function(a, b) {
        return a.date.getTime() - b.date.getTime();
    };
    this.photos.sort(fn);
    for (var group in this.photosByCamera){
        this.photosByCamera[group].sort(fn);
    }
};

PhotoHandler.prototype.calculatePhotoTimelinePercents=function(margin){
    margin=margin||this.timeMargin;
    /* calculate the timestamp range*/
    this.timelineFirst=this.getFirstTimestamp()-margin;
    this.timelineLast=this.getLastTimestamp()+margin;
    this.timelineLength=this.timelineLast-this.timelineFirst;
    var first=this.timelineFirst,last=this.timelineLast,length=this.timelineLength;
    
    /* calculate for every item the percent*/
    $.each(this.photos,function(index,it){
        var ts=it.date.getTime();
        var pos=ts-first;
        it.pct=(pos/length)*100;
    });
};

PhotoHandler.prototype.getFirstTimestamp=function(){
    return this.photos[0].date.getTime();
};
PhotoHandler.prototype.getLastTimestamp=function(){
    return this.photos[this.photos.length-1].date.getTime();
};