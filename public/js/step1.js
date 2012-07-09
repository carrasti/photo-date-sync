var photoSyncStep1 = {
    data : undefined,
    init : function(opts) {
        this.photoHandler = new PhotoHandler();
        $('#content > div').each(function(index, item) {
            var it = $(item);
            it.removeClass('active');
            if (index == 1) {
                it.addClass('active');
            }
        });
        this.initTools();

        var el = $.tmpl('sortPage', {}).appendTo('#photoSync');
        var photoCt = el.find('.photo-ct-outer');

        // this.addDirectory({ path :
        // '/media/EXTRA/PHOTOS/2012/2012_06_22-23_Juhannus/Nicole' });
        this.addDirectory({
            path : '/media/EXTRA/PHOTOS/2012/2012_06_22-23_Juhannus/Tiina'
        });

        /*
         * this.addDirectory({ path :
         * '/media/EXTRA/PHOTOS/2012/2012_04_28_05_01_Poland' });
         */
        /*
         * this.addDirectory({ path :
         * '/media/EXTRA/PHOTOS/2011/2011_09_28-10-16_Belgium_Madrid' });
         */

    },
    initTools : function() {

        var tools = [ {
            text : 'Add directory',
            cls : 'add_dir icon icon-folder'
        }, {
            text : 'New project',
            cls : 'new_project icon icon-exit'
        } ];

        var toolsUl = $('header .tools ul');
        $.tmpl('tools', {
            tools : tools
        }).appendTo(toolsUl);
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
        for ( var key in data.files) {
            var it = data.files[key];
            var date = it['Exif.Photo.DateTimeDigitized'];
            if (date) {
                var parts = date.match(/(\d+):(\d+):(\d+) (\d+):(\d+):(\d+)/);
                date = new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10));
            }
            var o = {
                thumbnail : it['Thumbnail'],
                date : date,
                name : key,
                camera : it['Exif.Image.Make'],
                model : it['Exif.Image.Model']
            };
            this.photoHandler.addPhoto(o);
        };
        this.photoHandler.sortByDate(data);
        this.updateUi();
    },
    updateUi : function() {
        var photosEl = $('#photoSync .photos-ct');
        var camerasEl = $('#photoSync .cameras > ul');

        var pH = this.photoHandler;

        photosEl.html('');
        $.each(pH.photosByCamera, function(g, group) {
            if (!group.elPhotos) {
                var el = $.tmpl('photoRow', {}).appendTo(photosEl);
                // add the row and update the element for the camera
                group.elPhotos = el.find('ul');

                var o = {};
                $(group.elPhotos[0]).draggable({
                    axis : "x",

                    start : (function(originalPos) {
                        return function(event, ui) {
                            originalPos.left = ui.helper.css('left');
                        };
                    })(o),
                    drag : (function(originalPos) {
                        return function(event, ui) {
                            console.debug(originalPos.left);
                        };
                    })(o)
                });
                // add the camera
                group.elTitle = $.tmpl('camera', {
                    camera : group.name
                }).appendTo(camerasEl);
            }

            $.each(group.photos, function(index, photo) {
                // create the photo elements;
                if (!photo.el) {
                    photo.el = $.tmpl('photo', photo).appendTo(group.elPhotos);
                }
            });
        });

        // calculate all percents and put
        pH.updateUi();

        /* start 1000 pixels for 30 minutes */
        var thirtyMinutes = 600000;
        var photosElWidth = Math.ceil((pH.timelineLength / thirtyMinutes) * 1000);
        photosEl.width(photosElWidth);
        
        
        var photoCt=photosEl.parent();
        photoCt.unbind('mousewheel');
        var scaleO = {
                originalWidth : photosEl.width(),
                currentScale : 0
            };
        photoCt.mousewheel((function(o) {
            return function(event, delta, deltaX, deltaY) {
                var nextCurrentScale=o.currentScale+(delta/2);
                var nextWidth=o.originalWidth*Math.exp((o.currentScale) / 10);
                var tgt = $(event.currentTarget);
                var photos=tgt.find('.photostream');
                console.debug(nextWidth);
                if (delta<0 && nextWidth < tgt.width()){
                    photos.width(tgt.width());
                }else{
                    o.currentScale=nextCurrentScale;
                    photos.width(nextWidth);
                }
                
            };
        })(scaleO));
        
    }
};