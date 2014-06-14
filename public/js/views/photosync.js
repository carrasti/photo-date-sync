define([
        'jquery',
        'underscore',
        'backbone',
        'jquery.mousewheel',
        'jquery.ui.custom',
        'collections/photos',
        'models/photogroup',
        'views/photogroup',
        'util/timeutil',
        'util/scalehelper',
        'util/dragdrophelper',
], function($, _, Backbone, $mousewheel, $ui, PhotosCollection, PhotoGroup, PhotoGroupView, TimeUtil,ScaleHelper,DragDropHelper) {

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
            var PhotoGroupCollection = Backbone.Collection.extend({
                model : PhotoGroup
            });
            this.photoGroups = new PhotoGroupCollection();

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
            this.trigger('request_showmask',this,'wait','Loading pictures, please wait');
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
                if (!date){
                    date = it['Exif.Photo.DateTimeOriginal'];
                }
                if (!date){
                    date = it['Exif.Image.DateTime'];
                }


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
            PhotoGroupView.disabledAnimations=true;
            this.photoGroups.each(function(photoGroup, index) {
                // do this to check if it is initialized, with throttle sometimes the group is not initialized
                if (photoGroup.id) {
                    photoGroup.updatePcts(paddedFirstTs, paddedLastTs);
                }
            });
            PhotoGroupView.disabledAnimations=false;

            //adjust the scale
            this.scaleHelper.set({firstTs:paddedFirstTs,lastTs:paddedLastTs});
            this.scaleHelper.fitScale(firstTs,lastTs,false);

            this.trigger('request_hidemask',this);

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
            $(this.el).find('.distribute-height').height((100 / (this.photoGroups.length)) + '%');
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

                this.scaleHelper.scale(undefined, delta>0?1:-1, mouseOffset, true);
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
            this.trigger('gonext', this);
        }
    });
    return PhotoSyncView;
});
