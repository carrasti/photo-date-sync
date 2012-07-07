var photoSyncStep1 = {
    data : undefined,
    init : function(opts) {
        this.data = {};
        $('#content > div').each(function(index, item) {
            var it = $(item);
            it.removeClass('active');
            if (index == 1) {
                it.addClass('active');
            }
        });


        this.addDirectory({
            path : '/media/EXTRA/PHOTOS/2012/2012_06_22-23_Juhannus'
        });
        /*this.addDirectory({
            path : '/media/EXTRA/PHOTOS/2012/2012_04_28_05_01_Poland'
        });*/
        

    },
    addDirectory : function(pathOpts) {
        var ulEl = $('#photoSync > .directories > ul');
        var newRowNum = ulEl.children().length;
        $("#tplPhotoAlignRow").tmpl({}).appendTo(ulEl);

        if (pathOpts) {
            this.setDirectory(newRowNum, pathOpts);
        } else {
            this.setEmptyDirectory(newRowNum);
        }
    },
    setEmptyDirectory : function(rowNum) {
        var liEl = $('#photoSync > .directories > ul > li')[rowNum];
        $("#tplDirectoryselectEmpty").tmpl({}).appendTo(liEl);
    },
    setDirectory : function(rowNum, pathOpts) {
        var liEl = $('#photoSync > .directories > ul > li')[rowNum];
        var directory = $(liEl).find(".directoryselect")[0]
        var parts = pathOpts.path.split('/');
        var data = {
            basename : parts.pop(),
            dirname : parts.join('/')
        };

        $("#tplDirectoryselectSelected").tmpl(data).appendTo(directory);
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
            var date = it['Exif.Image.DateTime'];
            var parts = date.match(/(\d+):(\d+):(\d+) (\d+):(\d+):(\d+)/);
            date = new Date(parseInt(parts[1], 10), parseInt(parts[2], 10)-1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10));
            var o = {
                thumbnail : it['Thumbnail'],
                date : date,
                name : key,
                camera : it['Exif.Image.Make'],
                model : it['Exif.Image.Model']
            };
            this.data[key] = o;
        };
        this.groupByCamera();

    },
    groupByCamera : function() {
        var photosEl = $('#photoSync > .photos');
        var tplPhotoGroup = $('#tplPhotoGroup');
        var tplImage = $('#tplImage');
        photosEl.html('');
        var groups = {};
        for ( var key in this.data) {
            var it = this.data[key];
            var camera = it.camera + ' ' + it.model;
            if (!groups.hasOwnProperty(camera)) {
                groups[camera] = [];
            }
            groups[camera].push(it);
        }
        for ( var g in groups) {
            var group = groups[g];
            group.sort(function(a, b) {
                return a.date.getTime() - b.date.getTime();
            });
            var el = tplPhotoGroup.tmpl({
                camera : g
            }).appendTo(photosEl);
            var imagePh = el.find('.photostream > ul');
            for ( var file in group) {
                tplImage.tmpl(group[file]).appendTo(imagePh);
            }

        }
    }
};