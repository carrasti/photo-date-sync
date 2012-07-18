define([
  'jquery',
  'underscore', 
  'backbone',
  'collections/tools',
  'text!templates/tools.html',
  'views/photosync'
  ], function($, _, Backbone, ToolsCollection, toolsTemplate,PhotoSyncView){
  var AppView = Backbone.View.extend({
    el: $("#content"),
    toolsEl: $(".tools ul"),
    
    toolsTemplate: _.template(toolsTemplate),

    // Delegated events for creating new items, and clearing completed ones.
    //events: {
    //  "click .todo-clear a": "clearCompleted"
    //},

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos from the server.
    initialize: function(opts) {
      opts=opts||{};
      
      this.render();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      this.renderPhotoSync();
    },
    renderPhotoSync:function(){
        this.renderTools([{
            text : 'Add directory',
            cls : 'add_dir icon icon-folder'
        },{
            text : 'New project',
            cls : 'new_project icon icon-exit'
        }]);
    },
    renderTools:function(tools){
        $(this.toolsEl).html(this.toolsTemplate({tools:tools}));
    }
  });
  return AppView;
});
