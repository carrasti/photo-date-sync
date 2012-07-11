var photoSyncStep1 = {
    data : undefined,
    init : function(opts) {
        opts=opts||{};

        this.photoHandler = new PhotoHandler();
        $('#content > div').each(function(index, item) {
            var it = $(item);
            it.removeClass('active');
            if (index == 1) {
                it.addClass('active');
            }
        });
        this.initTools();

        this.scale=opts.scale || 4;

        var el = $.tmpl('sortPage', {}).appendTo('#photoSync');
        var photoCt = el.find('.photo-ct-outer');

        this.addDirectory({
            path : '/home/arrastia/Desktop/2012_06_22-23_Juhannus'
        });
        /*this.addDirectory({
            path : '/media/EXTRA/PHOTOS/2012/2012_06_22-23_Juhannus/Tiina'
        });*/

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
                            originalPos.leftCss = ui.helper.css('left');
                            originalPos.rightCss = ui.helper.css('right');
                            originalPos.left = ui.helper.offset().left-ui.helper.parent().offset().left
                        };
                    })(o),
                    drag : (function(originalPos) {
                        return function(event, ui) {
                            var pct=originalPos.leftCss.split("%")[0];
                            var pctr=originalPos.leftCss.split("%")[0];
                            var newpct=(ui.helper.offset().left/originalPos.left)*pct;
                            var diff = newpct - pct;
                            console.debug(pctr+diff)+'%'
                            ui.helper.css('right',(pctr+diff)+'%')
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

        // change size according to the full timeline size
        this.adjustWidthToScale(undefined,undefined,undefined,true);

        //set vertical heights
        $('#photoSync .distribute-height').height((100/camerasEl.children().length)+'%');

        var photoCt = photosEl.parent();
        photoCt.unbind('mousewheel');
        var scaleO = {
            originalWidth : photosEl.width(),
            photosEl : photosEl,
            controllerO:this
        };
        photoCt.mousewheel((function(o) {
            return function(event, delta, deltaX, deltaY) {
                var ct = o.photosEl, scrollEl = ct.parent();

                event.preventDefault();
                event.stopPropagation();


                if (!event.shiftKey) {
                    //scroll
                    scrollEl.stop(false, true);
                    scrollEl.animate({
                        scrollLeft : scrollEl.scrollLeft() - (delta * scrollEl.width() / 3.3)
                    }, 100);
                } else {
                    //scale
                    o.controllerO.adjustWidthToScale(undefined,delta,event.pageX-scrollEl.offset().left,true);
                }
            };
        })(scaleO));
    },
    adjustWidthToScale:function(scale,delta,offset,animate){
        delta=delta||0;
        animate=animate||false;
        var newScale=scale||(Math.min(TIME_PRECISION.length,Math.max(0,this.scale+delta)));
        this.scale=newScale;
        var pH=this.photoHandler,scrollEl = $('#photoSync .photo-ct-outer'), ctEl=scrollEl.find('.photos-ct');
        var visibleAreaWidth=scrollEl.width()
        //offset=offset||Math.floor(visibleAreaWidth/2);
        offset=offset||0;
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
};
