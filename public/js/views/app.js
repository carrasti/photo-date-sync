define([
        'jquery',
        'underscore',
        'backbone',
        'collections/tools',
        'views/app-tools',
        'views/photosync',
        'views/photosave',
        'temp/sourcephotofolders'
], function($, _, Backbone, ToolsCollection, AppToolsView, PhotoSyncView, PhotoSaveView,photosList) {
    var AppView = Backbone.View.extend({
        el : $('body'),
        contentEl : $('#content'),
        toolsEl : $('.tools ul'),

        // references to other views
        photoSyncView:undefined,
        photoSaveView:undefined,

        events : {
            'click header .tools li' : 'onToolClicked'
        },

        initialize : function(opts) {
            opts = opts || {};

            /* initialize data structures */
            this.toolsCollection = new ToolsCollection();

            /* initialize views */
            this.initializeViews();

            this.render();
        },

        initializeViews : function() {
            /*----- tools view -----*/
            this.toolsView = new AppToolsView({
                collection : this.toolsCollection
            });
        },

        render : function() {
            this.goToView('sync');
        },
        
        goToView:function(view){
            switch(view){
                case 'save':
                    this.goToPhotoSave();
                    break;
                case 'sync':
                    this.goToPhotoSync();
                    break;
            }
        },
        
        
        goToPhotoSync:function(){
            if (this.photoSyncView){
                if (this.photoSyncView.$el.filter(':hidden').length==0){
                    return
                }
            }else{
                this.photoSyncView = new PhotoSyncView();
                this.photoSyncView.on('gonext',function(){
                    this.goToView('save');
                },this);
                        
                this.photoSyncView.render();
                
                //temporary until selection of directories is implemented
                _.each(photosList,function(item, index){
                    this.photoSyncView.addDirectory({
                        path: item
                    });
                },this);
            }

            this.photoSyncView.$el.show();

            if (this.photoSaveView) {
                this.photoSaveView.$el.hide();
            }
            
            this.toolsCollection.reset([
                                        {
                                            text : 'Add directory',
                                            cls : 'add_dir icon icon-folder'
                                        },
                                        {
                                            text : 'New project',
                                            cls : 'new_project icon icon-exit'
                                        }
                                ]);
        },
        goToPhotoSave:function(){
            if (this.photoSaveView){
                if (this.photoSaveView.$el.filter(':hidden').length==0){
                    return
                }
            }else{
                this.photoSaveView = new PhotoSaveView();
                this.photoSaveView.on('gosync',function(){
                    this.goToView('sync');
                },this);
                this.photoSyncView.render();
            }
            
            this.photoSaveView.updatePhotoList(this.photoSyncView.photoGroups);
            
            this.photoSaveView.$el.show();

            if (this.photoSyncView) {
                this.photoSyncView.$el.hide();
            }
            
            this.toolsCollection.reset([]);
        },
        onToolClicked : function(event) {
            var target = event.currentTarget;
            var m = target.className.match(/^([^\s]+)\s/);
            if (!m) {
                return;
            }

            switch (m[1]) {
                case 'add_dir':
                    break;
                case 'new_project':
                    break;
            }

        }
    });
    return AppView;
});
