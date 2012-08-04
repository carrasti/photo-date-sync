define([
  'views/photo',
  ], function(PhotoView){
  var SavePhotoView = PhotoView.extend({
      initialize:function(){
      }
  });
  delete SavePhotoView.prototype.onGroupPctChang;
  
  return SavePhotoView;
});
