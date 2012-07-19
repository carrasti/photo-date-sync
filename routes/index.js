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
            res.json({
                error : err
            }, 500);
        }
        res.json(ret, {
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
                    res.json(fileMetadata);
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
