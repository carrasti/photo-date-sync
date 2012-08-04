define([
        'jquery',
        'underscore',
        'backbone',
        'jquery.mousewheel',
        'jquery.ui.custom',
        'collections/photos',
        'models/photogroup',
        'views/photogroup',
        'util/timeutil'
], function($, _, Backbone, $mousewheel, $ui, PhotosCollection, PhotoGroup, PhotoGroupView, TimeUtil) {
    var DragDropHelper = Backbone.Model.extend({
        initialize : function(opts) {
            this.$el = $(opts.el);
            this.group = opts.model;
            this.view = opts.view;
        },
        onStartDrag : function(event, ui) {
            this.group.dragging = true;
            this.set('width', this.$el.width());
            this.$el.width(this.get('width'));
            this.$el.css('right', '');
        },

        onDrag : function(event, ui) {
            this.updateGroupTsData();
        },

        onEndDrag : function() {
            this.group.recalculatePctsBlock();
            this.$el.width('auto');
            this.group.dragging = false;
        },
        updateGroupTsData : function(end) {
            var newTs = this.getNewTs();
            this.group.set({
                'firstTs' : newTs
            });
        },
        getNewTs:function(){
            var length=this.group.get('timelineLastTs')-this.group.get('timelineFirstTs');
            return Math.floor(this.group.get('timelineFirstTs')+(length*(this.getLeftPct()/100)));
        },
        getLeftPct:function(){
            return (this.$el.position().left/this.$el.parent().width())*100;
        }
    });

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



    var PhotoSyncView = Backbone.View.extend({
        el : $('#photoSync'),

        photosCollection : undefined,
        noTsPhotosCollection : undefined,
        photoGroups : undefined,
        
        showNextEnabled:false,
        
        events:{
            'click .action-next' : 'onActionNextClick'
        },
        
        initialize : function(opts) {
            opts = opts || {};
            this.photoGroups = new Backbone.Collection({
                model : PhotoGroup
            });
            this.photoGroups.on('add', this.onPhotoGroupsAdd, this);
            this.photoGroups.on('change:firstTs',_.throttle(this.onGroupTimeAdjusted,500),this);
            
            this.photosCollection = new PhotosCollection();

            this.noTsPhotosCollection = new PhotosCollection();
            this.photosCollection.on('add', this.onPhotosCollectionAdd, this);

            this.timelineMargin = opts.timelineMargin || 600000; // 10 minutes margin for timeline
            this.blockMargin = opts.blockMargin || 180000; // 3 minutes margin for block
            this.$photosContainer = this.$el.find('.photos-ct');
            this.$photosContainer.parent().mousewheel(_.bind(this.onPhotosMouseWheel,this));

            this.scaleHelper = new ScaleHelper({el:this.$photosContainer});
            
            
        },

        addDirectory : function(pathOpts) {
            if (pathOpts) {
                this.setDirectory(pathOpts);
            } else {
                // search
            }
        },
        setDirectory : function(pathOpts) {
            var parts = pathOpts.path.split('/');
            var data = {
                basename : parts.pop(),
                dirname : parts.join('/')
            };

            this.requestImages(pathOpts.path);
        },
        requestImages : function(path) {
            $.ajax({
                url : '/photolist',
                type : 'GET',
                data : {
                    path : path
                },
                success : this.requestImagesResponse,
                context : this
            });
        },
        requestImagesResponse : function(data, textStatus, response) {
            var noTsPhotos = [], tsPhotos = [];
            _.each(data.files, function(it, key, collection) {
                var date = it['Exif.Photo.DateTimeDigitized'];
                if (date) {
                    var parts = date.match(/(\d+):(\d+):(\d+) (\d+):(\d+):(\d+)/);
                    date = new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10));
                }
                var o = {
                    thumbnail : it.Thumbnail,
                    date : date,
                    name : key,
                    cameraBrand : it['Exif.Image.Make'],
                    cameraModel : it['Exif.Image.Model']
                };
                if (date) {
                    tsPhotos.push(o);
                } else {
                    noTsPhotos.push(o);
                }
            });
            this.photosCollection.add(tsPhotos);
            this.noTsPhotosCollection.add(noTsPhotos);
        },
        onPhotosCollectionAdd : function(photo, collection) {
            var cameraName = photo.getCameraName();
            var group = this.photoGroups.get(cameraName);
            if (!group) {
                group = new PhotoGroup({
                    id : cameraName,
                    name : cameraName,
                    blockMargin : this.blockMargin
                });
                this.photoGroups.add(group);
                // initialize the view associated
            }
            group.addPhoto(photo);
            this.onPhotosCollectionAddBatchAfter();
        },
        onPhotosCollectionAddBatchAfter : _.throttle(function() {
            if (!this.firstThrottleAvoided) {
                this.firstThrottleAvoided = true;
                return;
            }

            var margin = this.timelineMargin, firstTs = this.photosCollection.first().getTs() - margin, lastTs = this.photosCollection.last().getTs() + margin;
            
            //messing up
            var distance=lastTs-firstTs,paddedFirstTs=firstTs-distance,paddedLastTs=lastTs+distance;
                
            this.photoGroups.each(function(photoGroup, index) {
                // do this to check if it is initialized, with throttle sometimes the group is not initialized
                if (photoGroup.id) {
                    photoGroup.updatePcts(paddedFirstTs, paddedLastTs);
                }

            });

            //adjust the scale
            this.scaleHelper.set({firstTs:paddedFirstTs,lastTs:paddedLastTs});
            this.scaleHelper.fitScale(firstTs,lastTs);

            delete (this.firstThrottleAvoided);
        }, 10),
        onPhotoGroupsAdd : function(photoGroup) {
            var groupView = new PhotoGroupView({
                model : photoGroup
            });
            
            groupView.render();
            this.initializeGroupDragAndDrop(groupView);
            this.distributeGroupHeights();
        },
        distributeGroupHeights : _.throttle(function() {
            $(this.el).find('.distribute-height').height((100 / (this.photoGroups.length - 1)) + '%');
        }, 50),

        initializeGroupDragAndDrop : function(groupView) {
            var ddh = new DragDropHelper({
                el : groupView.$block,
                model : groupView.model,
                view : this
            });
            groupView.$block.draggable({
                axis : "x",

                start : _.bind(ddh.onStartDrag, ddh),
                drag : _.bind(ddh.onDrag, ddh),
                stop : _.bind(ddh.onEndDrag, ddh)
            });
        },
        onPhotosMouseWheel : function(event, delta, deltaX, deltaY) {
            var ct=this.$photosContainer,scrollEl = ct.parent();

            event.preventDefault();
            event.stopPropagation();

            if (!event.shiftKey) {
                var leftScroll=scrollEl.scrollLeft() - (delta * scrollEl.width() / 3.3);
                this.photosScroll(leftScroll);
            } else {
                //scroll. check if it is an image, then we can center it on screen
                var mouseOffset=event.pageX;
                var isImg=$(event.target).parents('.photostream-image');
                if (isImg.length>0){
                    var imgLeft=isImg.offset().left;
                    distance=mouseOffset-imgLeft;
                    var dist=(delta>0?1:-1)*distance;
                    mouseOffset=imgLeft+dist;
                }
                
                
                this.photosScale(undefined, delta>0?1:-1, mouseOffset, true);
            }
        },
        photosScroll:function(leftValue){
            // scroll
            var scrollEl=this.$photosContainer.parent();
            scrollEl.stop(false, true);
            scrollEl.animate({
                scrollLeft : leftValue
            }, 100);
            this.scaleHelper.adjustTimeDividers(leftValue);
        },
        photosScale:function(scale,delta,mouseOffset,animate){
            this.scaleHelper.scale.apply(this.scaleHelper,arguments);
            return;

            delta=delta||0;
            animate=animate||false;
            var newScale=scale||(Math.min(TIME_PRECISION.length,Math.max(0,this.scale+delta)));
            this.scale=newScale;
            var pH=this.photoHandler,scrollEl = $('#photoSync .photo-ct-outer'), ctEl=scrollEl.find('.photos-ct');
            var visibleAreaWidth=scrollEl.width();
            offset=offset||Math.floor(visibleAreaWidth/2);
            //offset=offset||0;
            var availableScreenWidth=window.screen.width-($(document).width()-visibleAreaWidth);
            var oldWidth=ctEl.width();
            var newWidth=Math.ceil((pH.timelineLength / TIME_PRECISION[this.scale]) * availableScreenWidth);
            var widthChangePct=newWidth/oldWidth;
            var currentScrollLeft=scrollEl.scrollLeft();

            var newScrollLeft=Math.floor(((currentScrollLeft+offset)*widthChangePct)-offset);

            if (animate){
                ctEl.stop();
                ctEl.animate({width:newWidth},100);
                scrollEl.animate({scrollLeft:newScrollLeft},100);
            }else{
                ctEl.width(newWidth);
                scrollEl.scrollLeft(newScrollLeft);
            }
        },
        
        onGroupTimeAdjusted:function(model){
            var sameTs=(model.get('firstTs') == model.get('originalFirstTs'));
            if((!this.showNextEnabled && sameTs) || (this.showNextEnabled && !sameTs)){
                return
            }
            
            var index=this.photoGroups.find(function(item){
                return item.get('firstTs')!=item.get('originalFirstTs');
            });
            this.enableActionNext(index!=undefined);
        },
        
        enableActionNext:function(enable){
            var el=$('.action-next');
            this.showNextEnabled=(enable!==false);
            if (this.showNextEnabled){
                el.removeClass('disabled');
            }else{
                el.addClass('disabled');
            }
        },
        
        onActionNextClick:function(event){
            var tgt=$(event.currentTarget);
            if (tgt.hasClass('disabled')){
                return;
            }
        }
    });
    return PhotoSyncView;
});
