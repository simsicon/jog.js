window.Jog = Backbone.Router.extend({
  
  routes: {
    '!/articles/:id'          : "showArticle", 
    '!/articles/:id/comments' : "showComments",
    ''                      : "home"
  },
  
  initialize : function(){    
    _.bindAll(this, 'render', 'showArticle');
    this.articles = new Articles();
    this.article = new Article({title : '', content : ''});
    this.articleIndexs = new ArticleIndexs();
    this.articleView = new ArticleView({model: this.article});
    this.comment_action = new Comment_Action({model : this.article});
    this.comments = new Comments();
    this.comments.article = this.article;
    this.commentsView = new CommentsView({collection : this.comments});
    this.navView = new NavView({nav_prev: this.nav_prev, nav_next: this.nav_next, articleIndexs : this.articleIndexs, model : this.article});
    this.articleIndexs.fetch(); 
  },
  
  render : function(){
    $('.navi').empty();
    $('.navi').append(this.navView.render().el);
    $('.new_post').empty();
    $('#article').empty();
    $('#article').append(this.articleView.render().el);
    $('#user-actions').append(this.comment_action.el);
    $('#comment-area').append(this.commentsView.el);
  },
  
  home : function(){
    this.navView.options.articles_index = 0;
  },
  
  showArticle : function(article_id){
    this.navView.set_article_id(article_id);
    this.article.id = article_id;
    this.article.fetch();
    this.comments.fetch();
  },
  
  showComments : function(article_id){
    if(this.article.id != article_id){
      this.showArticle(article_id);
    };   
    this.comments.fetch();
  }
});