define([
  'jquery',
  'underscore',
  'backbone',
  'views/timeadjuster',
  'views/photo'
  ], function($, _, Backbone,TimeAdjusterView,PhotoView){
  var PhotoGroupView = Backbone.View.extend({
      tagName:'div',
      className:'distribute-height photostream',

      camerasParentEl:$('#photoSync .cameras ul'),
      cameraTpl:_.template('<li class="distribute-height cameramodel"><span title="<%= name %>"><%= name %></span></li>'),
      adjustersParentEl:$('#photoSync .timeadjust ul'),
      blocksParentEl:$('#photoSync .photos-ct'),
      $block: undefined, //this will be the ul element for the view where to add the photos and to position the block based in the percents from left, right
      animate:true,
      initialize:function(){
          //bindings
          this.model.photosCollection.on('add',this.onPhotosCollectionAdd,this);
          this.model.on('change:firstPct',this.onPctChange,this);
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
          var l=model.get('firstPct')+'%',r=(100-model.get('lastPct'))+'%';

          if (model.dragging===true || this.animate!==true || PhotoGroupView.disabledAnimations===true){
              //do not animate
              this.$block.css({'left':l,'right':r});
          }else{
              //animate
              this.$block.stop();
              this.$block.animate({'left':l,'right':r},400);
          }

      }
  });
  PhotoGroupView.disabledAnimations=false;
  return PhotoGroupView;
});
