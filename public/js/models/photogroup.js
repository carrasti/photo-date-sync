define([ 'jquery', 'backbone', 'underscore', 'collections/photos', 'models/photo','util/timeutil' ], function($, Backbone, _, PhotosCollection, Photo,TimeUtil) {
    var PhotoGroup = Backbone.Model.extend({
        photosCollection : undefined,
        noTsPhotosCollection : undefined,
        defaults : {
            timelineFirstTs : 0,
            timelineLastTs : 0,
            originalFirstTs : 0,
            firstTs : 0,
            firstPct : 0,
            lastPct : 0,
            blockMargin: 180000 //3 minutes margin
        },
        initialize : function() {
            this.photosCollection = new PhotosCollection();
            this.noTsPhotosCollection = new PhotosCollection();
        },
        updatePcts : function(startTs, endTs) {
            var pCol=this.photosCollection, margin=this.get('blockMargin');
            pCol.sort();
            var oldTlFirstTs=this.get('timelineFirstTs'),newTlFirstTs=startTs-margin;
            var oldTlLastTs=this.get('timelineLastTs'),newTlLastTs=endTs+margin;
            var oldOriginalFirstTs=this.get('originalFirstTs'),newOriginalFirstTs=pCol.first().getTs()-margin;
            var oldFirstTs=this.get('firstTs'),newLastTs=pCol.last().getTs()+margin;
            var newFirstTs;
            //check if it is needed to calculate the percent for the group;
            if (oldTlFirstTs!=newTlFirstTs||oldTlLastTs!=newTlLastTs||oldOriginalFirstTs!=newOriginalFirstTs){
                
                var diff = newOriginalFirstTs - oldOriginalFirstTs;
                newFirstTs=oldFirstTs + diff;
                firstPct = TimeUtil.tsCalculatePct(newFirstTs,newTlFirstTs,newTlLastTs);
                lastPct = TimeUtil.tsCalculatePct(newLastTs, newTlFirstTs,newTlLastTs);
                
                this.set({
                    timelineFirstTs : newTlFirstTs,
                    timelineLastTs : newTlLastTs,
                    originalFirstTs : newOriginalFirstTs,
                    firstTs : newFirstTs,
                    firstPct : firstPct,
                    lastPct : lastPct
                });
            }
            newFirstTs=this.get('firstTs');
            
            //check if needed to calculate percent for pictures (only when firstPctChanges)
            //for now process always
            this.photosCollection.each(function(photo, index) {
                photo.set('groupPct',TimeUtil.tsCalculatePct(photo.getTs(),newFirstTs,newLastTs));
            });
        },
        addPhoto : function(photo) {
            if (_.has(photo, 'cid')) {
                // is a model
            } else {
                // is an object
                photo = new Photo(photo);
            }

            if (photo.has('date')) {
                this.photosCollection.add(photo);
            } else {
                this.noTsPhotosCollection.add(photo);
            }
        }
    });
    return PhotoGroup;
});
