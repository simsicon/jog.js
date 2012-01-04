window.Nav_Link = Backbone.Model.extend({});

window.VerifyCredentials = Backbone.Model.extend({
  url : "/verify_credentials"
});

window.Article = Backbone.Model.extend({
  
  url : function() {
    var base = 'articles';
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  }
});


window.ArticleIndexs = Backbone.Model.extend({
  url : function() {
    return '/article_indexs'
  }
});

window.Comment = Backbone.Model.extend({
  url : function(){
    return '/#articles/' + this.options.article_id + '/comments/' + this.id;
  }
});

window.Comment_Url = Backbone.Model.extend({}); 