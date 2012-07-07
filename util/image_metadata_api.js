(function(){
    
    function getMetadata(filename, callback){
        var ex = require('exiv2');
        
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
        
        ex.getImagePreviews(filename,function(err, previews) {
            var data=previews;
            if (!err && data.length>0){
                data=new Buffer(data[0].data).toString('base64');
            }
            
            finishProcessing('image',err,data);
          });
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