define([
        'jquery',
        'underscore',
        'backbone',
        'collections/photos',
        'views/photosave-photo'
], function($, _, Backbone, PhotosCollection,SavePhotoView) {

    var PhotoSaveView = Backbone.View.extend({
        el : $('#photoSave'),
        
        events:{
            'click .wizardnav .action-previous':'onPreviousClicked',
            'click .wizardnav .action-finish':'onFinishClicked'
        },
        
        photosCollection : undefined,
        
        initialize : function(opts) {
            this.photosCollection = new PhotosCollection();
            this.$photosCollectionEl=this.$el.find('.photostream');
        },
        updatePhotoList : function(photoGroupsCollection){
            this.photosCollection.reset();
            this.$photosCollectionEl.html('');
            
            photoGroupsCollection.each(function(group){
                var diff=group.get('firstTs')-group.get('originalFirstTs');
                group.photosCollection.each(function(photo){
                    var copy=photo.clone();
                    if (diff!==0){ 
                        copy.set('date',new Date(copy.getTs()+diff));
                    }
                    this.photosCollection.add(copy,{silent:true});
                },this);
            },this);
            
            this.photosCollection.sortBy(function(o){
                return o.getTs();
            });
            
            this.photosCollection.each(function(photo){
                this.addPhotoView(photo);
            },this);
        },
        addPhotoView:function(photo){
            var view=new SavePhotoView({model:photo});
            this.$photosCollectionEl.append(view.render().el);
        },
        onPreviousClicked:function(){
            this.trigger('gosync',this);
        },
        onFinishClicked:function(){
            this.trigger('gosave',this,this.photosCollection);
        }
    });
    return PhotoSaveView;
});
