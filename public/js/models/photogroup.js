define([
        'jquery',
        'backbone',
        'underscore',
        'collections/photos',
        'models/photo'
], function($, Backbone, _,PhotosCollection,Photo) {
    var PhotoGroup = Backbone.Model.extend({
        photosCollection:undefined,
        noTsPhotosCollection:undefined,
        defaults:{
            firstPct:0,
            lastPct:0
        },
        initialize:function(){
            this.photosCollection=new PhotosCollection();
            this.noTsPhotosCollection=new PhotosCollection();
        },
        updatePcts:function(startTs,endTs){
            this.photosCollection.sort();
            console.debug('calculatepct for group',this.get('name'));
            this.photosCollection.each(function(model,collection){
                console.debug('calculate pct for each photo');
            });
        },
        addPhoto:function(photo){
            if (_.has(photo,'cid')){
                //is a model
            }else{
                //is an object
                photo=new Photo(photo);
            }

            if (photo.has('date')){
                this.photosCollection.add(photo);
            }else{
                this.noTsPhotosCollection.add(photo);
            }
        }
    });
    return PhotoGroup;
});
