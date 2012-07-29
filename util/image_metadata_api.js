(function(){
    
    function getMetadata(filename, callback){
        var ex = require('exiv2'),
        im = require('imagemagick'),
        fs = require('fs'),
        spawn = require('child_process').spawn;

        
        var loadedData={
                metadataLoaded:false,
                imageLoadad:true,
                metadata:undefined,
                image:undefined
        };
        
        var finishProcessing=function(type,error,data){
            loadedData[type+'Loaded']=true;
            loadedData[type]=[error,data];
            if (!loadedData.metadataLoaded || !loadedData.imageLoaded){
                return;
            }
            
            var callbackData=null;
            if (!loadedData.metadata[0]){
                callbackData=getMeaningfulData(loadedData.metadata[1]);
                if (!loadedData.image[0]){
                    callbackData.Thumbnail=loadedData.image[1];
                }
            }
            
            callback(callbackData);
        };
        
        ex.getImageTags(filename, function (error, metadata) {
            finishProcessing('metadata',error,metadata);
        });
        
        var callbackImagePreviews=null;
        callbackImagePreviews=function(err, previews) {
            var data=previews;
            if (!err && data.length>0){
                data=data[0].data;
                data=new Buffer(data).toString('base64');
                finishProcessing('image',err,data);
            }else{
                //generate the thumbnail if it does not exist
                var tempImage='/tmp/photosync-img-'+(new Date().getTime())+'.jpg';
                im.resize({
                    srcData: fs.readFileSync(filename, 'binary'),
                    dstPath:tempImage,
                    width:   160,
                    height:   160,
                    format:'jpg'
                  }, function(err, stdout, stderr){
                    if (err){
                        finishProcessing('image',err,null);
                        return;
                    }
                    
                    //var fd =  fs.openSync("/tmp/manual-test"+(new Date().getTime())+'.jpg', 'w');
                    //var buff = new Buffer(stdout, 'binary');
                    
                    /* in a child process save the metadata for the image */
                    var exiftoolsave  = spawn('exiftool',
                            ['-ThumbnailImage<='+tempImage,'-m', '-overwrite_original',filename]);
                    
                    exiftoolsave.on('exit', function (code, signal) {
                        fs.unlink(tempImage);
                        if (code == 0){
                            console.log('UPDATED thumbnail for ' + filename);
                            ex.getImagePreviews(filename,callbackImagePreviews);
                        }else{
                            console.log('FAILED UPDATING thumbnail for ' + filename);
                            finishProcessing('image',err,null);
                        }
                    });
                  });
            }
        };
        
        ex.getImagePreviews(filename,callbackImagePreviews);
    }
    function getMeaningfulData(metadata){
        var fields=["Exif.Image.DateTime","Exif.Image.Make","Exif.Image.Model","Exif.Photo.DateTimeDigitized","Exif.Photo.DateTimeOriginal"];
        var ret={};
        for (var i=0;i<fields.length;i++){
            var attr=fields[i];
            if (metadata.hasOwnProperty(attr)){
                ret[attr]=metadata[attr];
            }
        }
        return ret;
    }
    
    exports.getMetadata=getMetadata;
    
})();