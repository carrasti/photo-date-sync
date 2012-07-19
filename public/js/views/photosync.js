define([
        'jquery',
        'underscore',
        'backbone',
        'collections/photos',
        'models/photogroup',
        'views/photogroup'
], function($, _, Backbone, PhotosCollection, PhotoGroup, PhotoGroupView) {
    var PhotoSyncView = Backbone.View.extend({
        el : $('#photoSync'),

        photosCollection : undefined,
        noTsPhotosCollection : undefined,
        photoGroups : undefined,
        initialize : function(opts) {
            opts=opts||{};
            this.photoGroups = new Backbone.Collection({
                model : PhotoGroup
            });
            this.photoGroups.on('add', this.onPhotoGroupsAdd, this);

            this.photosCollection = new PhotosCollection();

            this.noTsPhotosCollection = new PhotosCollection();
            this.photosCollection.on('add', this.onPhotosCollectionAdd, this);
            
            this.timelineMargin=opts.timelineMargin||600000; //10 minutes margin for timeline
            this.blockMargin=opts.blockMargin||180000; //3 minutes margin for block
            
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
                    name: cameraName,
                    blockMargin:this.blockMargin
                });
                this.photoGroups.add(group);
                // initialize the view associated
            }
            group.addPhoto(photo);
            this.onPhotosCollectionAddBatchAfter();
        },
        onPhotosCollectionAddBatchAfter:_.throttle(function(){
            if (!this.firstThrottleAvoided){
                this.firstThrottleAvoided=true;
                return;
            }
            var margin=this.timelineMargin,firstTs=this.photosCollection.first().getTs()-margin,
                lastTs=this.photosCollection.last().getTs()+margin;
            this.photoGroups.each(function(photoGroup, index){
                //do this to check if it is initialized, with throttle sometimes the group is not initialized
                if(photoGroup.id){
                    photoGroup.updatePcts(firstTs,lastTs);                    
                }

            });
            delete(this.firstThrottleAvoided);
        },10),
        onPhotoGroupsAdd : function(photoGroup) {
            var view=new PhotoGroupView({model:photoGroup});
            view.render();
            this.distributeGroupHeights();
        },
        distributeGroupHeights:  _.throttle(function(){
            $(this.el).find('.distribute-height').height((100/(this.photoGroups.length-1))+'%');
        },50)
    });
    return PhotoSyncView;
});
