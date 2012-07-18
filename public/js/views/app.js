define([
        'jquery',
        'underscore',
        'backbone',
        'collections/tools',
        'views/app-tools'
], function($, _, Backbone, ToolsCollection, AppToolsView) {
    var AppView = Backbone.View.extend({
        el : $("#content"),
        toolsEl : $(".tools ul"),
        initialize : function(opts) {
            opts = opts || {};

            this.toolsCollection = new ToolsCollection();
            this.toolsView = new AppToolsView({
                collection : this.toolsCollection
            });

            this.render();
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
        }
    });
    return AppView;
});
