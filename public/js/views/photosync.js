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
        },
    });

    var ScaleHelper = Backbone.Model.extend({
        defaults:{
            currentScale:undefined,
            currentPct:undefined,
            firstTs:0,
            lastTs:0
        },
        initialize : function(opts){
            this.$el=$(opts.el);
            this.$sizeHelper=this.$el.parent().find('.size-helper');
            if (this.$sizeHelper.length===0){
				this.$sizeHelper=this.$el.before('<div class="size-helper"></div>').prev();
				this.$sizeHelper.height(0);
				this.$sizeHelper.css({visibility:'hidden'});
			}
            
        },
        fitScale:function(){
            this.set('currentScale',TimeUtil.scaleGetBest(this.get('firstTs'),this.get('lastTs')));
            this.scale();
        },
        scale:function(scale, scaleDiff, mouseOffset, animate){
            scaleDiff=scaleDiff || 0;
            scale=scale||(this.get('currentScale')+scaleDiff);
            if (scale<0||scale>TimeUtil.SCALES.length ){
                return;
            }
            var el=this.$el,scroller=el.parent(),oldPct=this.get('currentPct');
            this.set('currentScale',scale);
            var newPct=TimeUtil.getScalePct(scale,this.get('firstTs'),this.get('lastTs'));
			var elNewWidthPct=newPct+'%';
			this.set('currentPct',newPct);
            this.$sizeHelper.width(elNewWidthPct);
            console.debug('oldSize',this.$el.width());
            console.debug('newSize',this.$sizeHelper.width());
            
		
            /*var scrollerScrollLeft=scroller.scrollLeft();
            var elPixelWidth=el.width();
            var elNewWidthPct=newPct+'%';
            var scrollerOffsetLeft=scroller.offset().left;
            var mouseCenter=mouseOffset?mouseOffset - scrollerOffsetLeft:Math.floor(scroller.width()/2);
            */
            
            
            //calculate new scroll left, bad accuracy
            /*
            var mouseDistancePixels=scrollerScrollLeft - mouseCenter;
            var newScrollLeftPx=undefined;
            if (oldPct){
				var newWidth=newPct*elPixelWidth/oldPct;
			}
            
            
            
            el.width(elNewWidthPct);
            var newPixelWidth=el.width();
            el.width(elPixelWidth)*/
            //console.debug('newPixelWidth',newPixelWidth);
            
            //console.debug("left",currentLeft,"current W",currentW,"W",w, "mouseO", mouseOffset);
            //stop the animations;
            el.stop();
            if (animate===true){
			//console.debug(scrollEl.scrollLeft());
				this.$el.animate({width:elNewWidthPct},200,function(){
					
					//console.debug('afterResize', $(this).width());
					//console.debug('args', arguments);
					});
			}else{
				this.$el.width(elNewWidthPct);
			}

        }
    });



    var PhotoSyncView = Backbone.View.extend({
        el : $('#photoSync'),

        photosCollection : undefined,
        noTsPhotosCollection : undefined,
        photoGroups : undefined,
        initialize : function(opts) {
            opts = opts || {};
            this.photoGroups = new Backbone.Collection({
                model : PhotoGroup
            });
            this.photoGroups.on('add', this.onPhotoGroupsAdd, this);

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
            this.photoGroups.each(function(photoGroup, index) {
                // do this to check if it is initialized, with throttle sometimes the group is not initialized
                if (photoGroup.id) {
                    photoGroup.updatePcts(firstTs, lastTs);
                }

            });

            //adjust the scale
            this.scaleHelper.set({firstTs:firstTs,lastTs:lastTs});
            this.scaleHelper.fitScale();

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
                this.photosScale(undefined, delta, event.offsetX, true);
            }
        },
        photosScroll:function(leftValue){
            // scroll
            var scrollEl=this.$photosContainer.parent();
            scrollEl.stop(false, true);
            scrollEl.animate({
                scrollLeft : leftValue
            }, 100);
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
        }
    });
    return PhotoSyncView;
});
