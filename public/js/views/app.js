define([
        'jquery',
        'underscore',
        'backbone',
        'collections/tools',
        'views/app-tools',
        'views/photosync',
        'views/photosave',
        'util/timeutil',
        'temp/sourcephotofolders',
        'temp/destphotofolders'
], function($, _, Backbone, ToolsCollection, AppToolsView, PhotoSyncView, PhotoSaveView,TimeUtil,sourcePhotosList,targetDirectory) {
    var AppView = Backbone.View.extend({
        el : $('body'),
        contentEl : $('#content'),
        toolsEl : $('.tools ul'),
        maskEl : $('#content .mask'),

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
                this.photoSyncView.on('request_showmask',function(view,type,message){
                    this.showMask(type,message);
                },this);
                this.photoSyncView.on('request_hidemask',function(){
                    this.hideMask();
                },this);

                this.photoSyncView.render();

                //temporary until selection of directories is implemented
                _.each(sourcePhotosList,function(item, index){
                    this.photoSyncView.addDirectory({
                        path: item
                    });
                },this);
            }

            if (this.photoSaveView) {
                this.photoSaveView.$el.hide();
            }

            this.photoSyncView.$el.show();


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
                this.photoSaveView.on('gosave',function(view,collection){
                    this.requestSave(collection);
                },this);
                this.photoSyncView.render();
            }

            this.photoSaveView.updatePhotoList(this.photoSyncView.photoGroups);

            if (this.photoSyncView) {
                this.photoSyncView.$el.hide();
            }
            this.photoSaveView.$el.show();
            this.toolsCollection.reset([]);
        },

        requestSave:function(collection){
            //this.showMask('wait','Saving changes and generating album, please wait');
            var data={};
            collection.each(function(item,index){
                data[item.get('name')]=index+'#'+TimeUtil.generateExifDate(item.get('date'));
            });
            data.targetDirectory = targetDirectory;

            $.ajax({
                url : '/savephotolist',
                type : 'POST',
                data : data,
                success : this.requestSaveSuccess,
                context : this
            });
        },
        requestSaveSuccess:function(){
            alert('success!')
            //this.showMask('success','Images saved to folder');
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

        },
        showMask:function(type, message){
            this.maskEl.find('.message').html(message);
            this.maskEl[0].className=this.maskEl[0].className.replace(/(^|\s)type-[^$\s]+(\s|$)/,'$1$2');
            this.maskEl.addClass('displayed type-'+type);
        },
        hideMask:function(){
            this.maskEl.removeClass('displayed');
        }

    });
    return AppView;
});
