/*
 * GET home page.
 */
exports.index = function(req, res) {
    res.render('index', {
        title : 'Express'
    });
};

exports.fsList = function(req, res) {
    var fs = require('fs');
    var path = req.params[0];

    if (path == '') {
        path = '/';
    }
    console.log(path);
    fs.readdir(path, function(err, files) {
        var ret = [];
        var retHeaders = {};
        if (!err) {
            files.forEach(function(val, index, array) {
                ret.push(path + val);
            });
            retHeaders['Content-Type'] = 'text/plain';
        } else {
            res.json(500, {
                error : err
            });
        }
        res.json(200, ret, {
            'Content-Type' : 'text/plain'
        });
    });
};

exports.photoList = function(req, res) {
    var walk = require('walk'), path = require('path'), fs = require('fs'), imageMetadataApi = require('../util/image_metadata_api.js'), walker;

    var requestedPath = req.query.path;
    walker = walk.walk(requestedPath);

    var fileList = [];
    walker.on("file", function(root, fileStats, next) {
        if (fileStats.name.match(/\.jpe?g$/i)) {
            fileList.push(path.join(root, fileStats.name));
        }
        next();
    });
    walker.on("end", function(root, fileStats, next) {
        var processingFiles = 0;
        var fileMetadata = {
            errors : [],
            files : {}
        };
        var metadataCallbackFn=function(imagePath){
            return function(metadataObject) {
                if (metadataObject) {
                    fileMetadata.files[imagePath] = metadataObject;
                } else {
                    fileMetadata.errors.push(imagePath);
                }

                processingFiles--;
                if (processingFiles === 0) {
                    res.json(200, fileMetadata);
                }
            };
        };

        while (fileList.length > 0) {
            var imagePath = fileList.pop();
            processingFiles++;
            imageMetadataApi.getMetadata(imagePath, metadataCallbackFn(imagePath));
        }
    });
};

exports.savePhotos=function(req, res) {
    //mkdirp comes from express dependencies
    var fs = require('fs'),
        fsExtra = require('fs-extra'),
        imageMetadataApi = require('../util/image_metadata_api.js'),
        mkdirp=require('mkdirp'),
        util=require('util'),
        path=require('path'),
        async = require('async'),
        exiv2 = require('exiv2');

    var data=req.body;
    var targetDirectory=data.targetDirectory;
    delete(data.targetDirectory);
    var files=[];

    for (var key in data){
        var item=data[key];
        var parts=item.split('#');
        files.push({sourcePath:key,newTime:parts[1], order:parseInt(parts[0],10)});
    }

    files.sort(function(a, b) {
        return a.order - b.order;
    });

    //quick and dirty zeropad
    var zeropad=function(num,padding){
        return ('00000000000000'+num).slice(-padding);
    };

    var processFiles=function(){
        var warnings=[];

        async.filter(files,function(it,callback){path.exists(it.sourcePath,callback);},function(results){
            //synchronous copy the files
            var l=results.length.toString().length;
            results.forEach(function(item,index){
                item.order=index+1;
            });
            async.forEachSeries(results,function(item,callback){
                var destPath=path.join(targetDirectory,["poland_2014_05_",zeropad(item.order,l),".jpg"].join(''));

                var writeTags=function(destFilePath,item,callback){
                    var d=item.newTime;

                    if (!path.existsSync(destFilePath)){
                        warnings.push(util.format('File to update metaata does not exist (%s)',destFilePath));
                        callback();
                        return;
                    }

                    var tags={
                            "Exif.Image.DateTime":d,
                            "Exif.Photo.DateTimeDigitized":d,
                            "Exif.Photo.DateTimeOriginal":d
                    };
                    exiv2.setImageTags(destFilePath, tags, function(err){
                        if (err){
                            warnings.push(util.format('Error updating metadata for file "%s"',destFilePath) +" "+err);
                        }
                        callback();
                    });
                };

                var copyCallback = function(err){
                    if (err) {
                        console.log(util.format('Error copying file "%s"',destPath));
                        warnings.push(util.format('Error copying file "%s"',destPath));
                      }
                      else {
                          console.log(util.format('COPIED file "%s"',destPath));
                          writeTags(destPath,item,callback);
                      }
                };


                if (!path.existsSync(destPath)){
                    fsExtra.copy(item.sourcePath, destPath,copyCallback);
                }
            },function(err){
                    res.json(200, {
                        message: util.format('Error creating folder "%s"',targetDirectory),
                        warnings:warnings,
                        error : err
                    });
            });
        });
    };


    mkdirp(targetDirectory,function(err){
        if (err){
            res.json(200, {
                message: util.format('Error creating folder "%s"',targetDirectory),
                error : err
            });
        }else{
            processFiles();
        }
    });




}