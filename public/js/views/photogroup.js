define([
  'jquery',
  'underscore',
  'backbone',
  'views/timeadjuster',
  'views/photo'
  ], function($, _, Backbone,TimeAdjusterView,PhotoView){
  var PhotoSyncView = Backbone.View.extend({
      tagName:'div',
      className:'distribute-height photostream',

      camerasParentEl:$('#photoSync .cameras ul'),
      cameraTpl:_.template('<li class="distribute-height cameramodel"><span title="<%= name %>"><%= name %></span></li>'),
      adjustersParentEl:$('#photoSync .timeadjust ul'),
      blocksParentEl:$('#photoSync .photos-ct'),
      $block: undefined, //this will be the ul element for the view where to add the photos and to position the block based in the percents from left, right
      initialize:function(){
          //bindings
          this.model.photosCollection.on('add',this.onPhotosCollectionAdd,this);
          this.model.on('change:firstPct change:lastPct',this.onPctChange,this);
      },

      render:function(){
          $(this.camerasParentEl).append(this.cameraTpl(this.model.toJSON()));
          var taView=new TimeAdjusterView({model:this.model});
          $(this.adjustersParentEl).append(taView.render().el);
          //adds itself. Perhaps this is not the most correct
          $(this.blocksParentEl).append($(this.el).html('<ul></ul>'));
          this.$block=this.$el.children().first();
          //create the view for the block and render
          return this;
      },
      onPhotosCollectionAdd:function(photo){
          var p=new PhotoView({model:photo});
          this.$block.append(p.render().el);
      },
      onPctChange:function(model){
          this.$block.css('left',model.get('firstPct')+'%');
          this.$block.css('right',(100-model.get('lastPct'))+'%');
      }

  });
  return PhotoSyncView;
});
