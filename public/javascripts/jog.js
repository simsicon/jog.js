(function($){  
  $(document).ready(function(){
    window.App = new Jog();
    window.App.render();
    Backbone.history.start();
  })
  
})(jQuery);