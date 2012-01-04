window.Articles = Backbone.Collection.extend({
  
  model: Article,
  
  url : function() {
    return '/articles'
  }
});

window.Comments = Backbone.Collection.extend({
  model: Comment,
  
  url : function(){
    return '/articles/' + this.article.id + '/comments'
  }
});