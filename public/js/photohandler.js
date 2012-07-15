var PhotoUtil = {
    calculatePct : function(pos, start, end) {
        var length = end - start;
        var zeroed = pos - start;
        return (zeroed / length) * 100;
    },
    sortPhotoArrayCompareFn : function(a, b) {
        return a.getTs() - b.getTs();
    },
    sortPhotoArray : function(photoArray) {
        photoArray.sort(PhotoUtil.sortPhotoArrayCompareFn);
    }
};



var PhotoGroup = function(name) {
    this.name = name;
    this.details = {};
    this.photos = [];
    this.noTsPhotos = [];
    this.elPhotos = undefined;
    this.elTitle = undefined;
    this.timeAdjuster = undefined;
    this.timelineStart = undefined;
    this.timelineEnd = undefined;
};

PhotoGroup.prototype.addPhoto = function(photo) {
    if (photo.date) {
        this.photos.push(photo);
    } else {
        this.noTsPhotos.push(photo);
    }
    photo.group = this;
};
PhotoGroup.prototype.calculatePcts = function(startTs, endTs,firstTs,lastTs) {
    firstTs = firstTs || this.getFirst().getTs();
    lastTs = lastTs || this.getLast().getTs();
    return [ PhotoUtil.calculatePct(firstTs, startTs, endTs), PhotoUtil.calculatePct(lastTs, startTs, endTs) ];
};
PhotoGroup.prototype.setPcts = function(pctFirst, pctLast,animate) {
    animate=animate||false;
    var el=this.elPhotos;
    this.details.pctFirst = pctFirst;
    this.details.pctLast = pctLast;
    if (el) {
        el=$(el);
        var l=this.details.pctFirst + '%',r=(100-this.details.pctLast) + '%';
        
        if (!animate){
            el.css('left', l);
            el.css('right', r);
        }else{
            el.stop();
            el.animate({left:l,right:r},400);
        }
    }
};
PhotoGroup.prototype.updatePcts = function(startTs, endTs, animate,firstTs,lastTs) {
    var params=this.calculatePcts(startTs, endTs, firstTs,lastTs);
    params.push(animate);
    this.setPcts.apply(this, params);
};
PhotoGroup.prototype.sortByDate = function() {
    PhotoUtil.sortPhotoArray(this.photos);
};
PhotoGroup.prototype.updatePhotosPct = function(startTs, endTs) {
    $.each(this.photos, function(index, photo) {
        photo.updatePct();
    });
};
PhotoGroup.prototype.getFirst = function() {
    return this.photos[0];
};
PhotoGroup.prototype.getLast = function() {
    return this.photos[this.photos.length - 1];
};

PhotoGroup.prototype.setTimeAdjuster = function(timeAdjuster) {
    this.timeAdjuster=timeAdjuster;
    $(this.timeAdjuster).on('changed_ts', {scope:this},function(event, adjuster, ts){
        var me=event.data.scope;
        $(me).trigger('move_request',[me,ts,true]);
    });
};
PhotoGroup.prototype.onChangedFirstTs=function(event, group, newTs){
    var me=event.data.scope;
    me.timeAdjuster.setTs(newTs,false);
};


var Photo = function(options) {
    this.date = options.date || null;
    this.thumbnail = (options.thumbnail && options.thumbnail !== "") ? options.thumbnail : '';
    this.name = options.name;
    this.camera = options.camera;
    this.model = options.model;
    this.group = undefined;
    this.pct = 0;
    this.el = undefined;
};

Photo.prototype.getCameraName = function() {
    if (!this.camera && !this.model) {
        return;
    } else {
        return [ this.camera, this.model ].join(' ');
    }
};

Photo.prototype.getTs = function() {
    return this.date.getTime();
};

Photo.prototype.calculatePct = function(startTs, endTs) {
    if (!this.group) {
        return;
    }
    startTs = startTs || this.group.getFirst().getTs();
    endTs = endTs || this.group.getLast().getTs();
    return PhotoUtil.calculatePct(this.getTs(), startTs, endTs);
};

Photo.prototype.updatePct = function() {
    var pct = this.calculatePct();
    if (pct) {
        this.setPct(pct);
    }
};

Photo.prototype.setPct = function(pct) {
    this.pct = pct;
    if (this.el) {
        this.el.css('left', this.pct + '%');
    }
};

var PhotoHandler = function(options) {
    options = options || {};
    this.photos = [];
    this.noTsPhotos = [];
    this.photosByCamera = {};
    this.removedPhotos = [];

    // default 10 minutes margin right left;
    this.timeMargin = options.timeMargin || 600000;
    this.timelineLength = undefined;
    this.timelineFirst = undefined;
    this.timelineLast = undefined;
};

PhotoHandler.prototype.addPhoto = function(data) {
    var photo = new Photo(data), cameraName = photo.getCameraName();

    if (photo.date) {
        this.photos.push(photo);
    } else {
        this.noTsPhotos.push(photo);
    }

    if (cameraName) {
        if (!this.photosByCamera.hasOwnProperty(cameraName)) {
            this.addGroup(cameraName);
        }
        this.photosByCamera[cameraName].addPhoto(photo);
    }
};

PhotoHandler.prototype.addGroup=function(groupName){
    var group=new PhotoGroup(groupName);
    this.photosByCamera[groupName] = group; 
    $(group).on('move_request',{scope:this},this.onGroupMoveRequest);
},

PhotoHandler.prototype.sortByDate = function() {
    PhotoUtil.sortPhotoArray(this.photos);

    this.timelineFirst = this.getFirst().getTs() - this.timeMargin;
    this.timelineLast = this.getLast().getTs() + this.timeMargin;
    this.timelineLength = this.timelineLast - this.timelineFirst;

    $.each(this.photosByCamera, function(key, group) {
        group.sortByDate();
    });
};

PhotoHandler.prototype.updateUi = function() {
    var photoHandler = this;
    $.each(this.photosByCamera, function(key, group) {
        group.timelineStart=photoHandler.timelineFirst;
        group.timelineEnd=photoHandler.timelineLast;
        group.updatePcts(photoHandler.timelineFirst, photoHandler.timelineLast);
        group.updatePhotosPct();
    });
};

PhotoHandler.prototype.getFirst = function() {
    return this.photos[0];
};
PhotoHandler.prototype.getLast = function() {
    return this.photos[this.photos.length - 1];
};

PhotoHandler.prototype.onGroupMoveRequest=function(event, group, newTs, animate){
    var me=event.data.scope;
    var delta=newTs-group.getFirst().getTs();
    var firstTs=newTs,lastTs=group.getLast().getTs()+delta;
    
    group.updatePcts(me.timelineFirst, me.timelineLast,true,firstTs,lastTs);
    
    /*
    PhotoGroup.prototype.moveStart=function(newTs,triggerEvent,animate){
        var firstTs=this.getFirst().getTs();
        var lastTs=this.getLast().getTs();
        var delta=newTs-firstTs;
        lastTs+=delta;
        
        this.setPcts()
    };*/
};

