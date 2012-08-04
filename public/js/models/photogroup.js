define([
        'jquery',
        'backbone',
        'underscore',
        'collections/photos',
        'models/photo',
        'util/timeutil'
], function($, Backbone, _, PhotosCollection, Photo, TimeUtil) {
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
            blockMargin : 180000
        // 3 minutes margin
        },
        initialize : function() {
            this.photosCollection = new PhotosCollection();
            this.noTsPhotosCollection = new PhotosCollection();
        },
        recalculatePctsBlock:function(silent){
            this.updatePctsBlock(false,false,silent,true);
        },
        updatePctsBlock : function(startTs, endTs, silent,forced) {
            silent = (silent === true);
            forced = (forced === true);


            var pCol = this.photosCollection, margin = this.get('blockMargin');
            startTs = startTs || this.get('timelineFirstTs')+margin;
            endTs = endTs || this.get('timelineLastTs')-margin;
            var oldTlFirstTs = this.get('timelineFirstTs'), newTlFirstTs = startTs - margin;
            var oldTlLastTs = this.get('timelineLastTs'), newTlLastTs = endTs + margin;
            var oldOriginalFirstTs = this.get('originalFirstTs'), newOriginalFirstTs = pCol.first().getTs() - margin;
            var newLastTs = pCol.last().getTs() + margin;
            var length = newLastTs-newOriginalFirstTs;
            var oldFirstTs = this.get('firstTs');
            var newFirstTs;
            // check if it is needed to calculate the percent for the group;
            if (forced || oldTlFirstTs != newTlFirstTs || oldTlLastTs != newTlLastTs || oldOriginalFirstTs != newOriginalFirstTs) {
                var diff = newOriginalFirstTs - oldOriginalFirstTs;
                newFirstTs = oldFirstTs + diff;
                firstPct = TimeUtil.tsCalculatePct(newFirstTs, newTlFirstTs, newTlLastTs);
                lastPct = TimeUtil.tsCalculatePct(newFirstTs+length, newTlFirstTs, newTlLastTs);

                var opts = {
                };
                if (silent){
                    opts.silent=true;
                };

                this.set({
                    timelineFirstTs : newTlFirstTs,
                    timelineLastTs : newTlLastTs,
                    originalFirstTs : newOriginalFirstTs,
                    firstTs : newFirstTs,
                    firstPct : firstPct,
                    lastPct : lastPct
                }, opts);
            }
        },
        updatePctsPhotos : function() {
            var firstTs = this.get('firstTs'), lastTs = this.photosCollection.last().getTs() + this.get('blockMargin');
            // check if needed to calculate percent for pictures (only when firstPctChanges)
            // for now process always
            this.photosCollection.each(function(photo, index) {
                photo.set('groupPct', TimeUtil.tsCalculatePct(photo.getTs(), firstTs, lastTs));
            });
        },
        updatePcts : function(startTs, endTs, silent) {
            this.updatePctsBlock(startTs, endTs, silent);
            this.updatePctsPhotos();
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
