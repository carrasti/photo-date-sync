define([
  'jquery',
  'underscore',
  'backbone',
  ], function($, _, Backbone,PhotosCollection){
  var PhotoSyncView = Backbone.View.extend({
      tagName:'div',
      className:'distribute-height photostream',

      camerasParentEl:$('#photoSync .cameras ul'),
      camerasEl:undefined,
      cameraTpl:_.template('<li class="distribute-height cameramodel"><span><%= name %></span></li>'),

      initialize:function(){
          //bindings
          //this.model.on()
      },

      render:function(){
          this.camerasEl=$(this.camerasParentEl).append(this.cameraTpl(this.model.toJSON()));
      }

  });
  return PhotoSyncView;
});
