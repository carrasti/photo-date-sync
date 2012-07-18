define([
  'jquery',
  'underscore', 
  'backbone',
  'collections/tools',
  ], function($, _, Backbone){
  var AppTools = Backbone.View.extend({
      el:$('ul')
  });
  return AppTools;
});
