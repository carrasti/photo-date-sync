define([
        'jquery',
        'underscore',
        'backbone',
        'collections/tools',
        'views/app-tools',
        'views/photosync'
], function($, _, Backbone, ToolsCollection, AppToolsView, PhotoSyncView) {
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
            this.renderPhotoSync();
        },
        renderPhotoSync : function() {
            this.toolsCollection.add([
                    {
                        text : 'Add directory',
                        cls : 'add_dir icon icon-folder'
                    },
                    {
                        text : 'New project',
                        cls : 'new_project icon icon-exit'
                    }
            ]);

            if (!this.photoSyncView) {
                this.photoSyncView = new PhotoSyncView();
                this.photoSyncView.render();
            }

            this.photoSyncView.$el.show();

            if (this.photoSaveView) {
                this.photoSaveView.$el.hide();
            }

            //temp
            this.photoSyncView.addDirectory({
                path:'/media/EXTRA/PHOTOS/2012/2012_07_23-27_Poland_Kaszuby_Gdansk'
            });


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
