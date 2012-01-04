window.NewPostFormView = Backbone.View.extend({
   template: '#new-post-template',
   
   initialize : function(){
     _.bindAll(this, 'render');
     this.initializeTemplate();
   },
   
   render : function(){
     $(this.el).html(this.template());
     return this;
   },
   
   initializeTemplate: function(){
   	this.template = _.template($(this.template).html());
   }
 });    
 

 window.Nav_Link_View = Backbone.View.extend({
   tagName: 'li',
   
   className: 'nav_link',
   
   template: "#nav-link-template",
   
   
   initialize : function(){
     _.bindAll(this, 'render');
     this.initializeTemplate();
     this.model.bind('change', this.render, this);
   },
   
   render : function(){
     $(this.el).html(this.template(this.model.toJSON()));
     if(this.model.get('article_id') == '#'){
       $(this.el).addClass('hidden');
     }else{
       $(this.el).removeClass('hidden');
     }
     
     if(this.model.get('nav_direction') == 'PREV'){
       $('#PREV').addClass('nav_icon prev');
       $(this.el).addClass('prev');
     }else{
       $('#NEXT').addClass('nav_icon next');
       $(this.el).addClass('next');
     }
     return this;
   },
     
   initializeTemplate: function(){
   	this.template = _.template($(this.template).html());
   }
 });
   
 window.NavView = window.Backbone.View.extend({
   tagName: 'ul',
   
   initialize : function(){
     _.bindAll(this, 'render');
     this.nav_prev = new Nav_Link({article_id : '#', nav_direction : 'PREV'});
     this.nav_next = new Nav_Link({article_id : '#', nav_direction : 'NEXT'});
     this.nav_prev_view = new Nav_Link_View({model : this.nav_prev });
     this.nav_next_view = new Nav_Link_View({model : this.nav_next });
     this.articleIndexs = this.options.articleIndexs;
     this.articleIndexs.bind('change', this.setArticles, this);
   },
  
   render : function(){
     $(this.el).append(this.nav_prev_view.render().el)
     $(this.el).append(this.nav_next_view.render().el)
     this.delegateEvents({'click a' : "click_url"});
     return this;
   },
   
   click_url : function(ev){
     if(ev.currentTarget.id == 'PREV'){
       var prev_prev_url = this.get_url_and_validate_index(this.articles_index - 3);
       var prev_url = this.get_url_and_validate_index(this.articles_index - 2);
       var next_url = this.get_url_and_validate_index(this.articles_index);
       var next_next_url = this.get_url_and_validate_index(this.articles_index + 1);
       this.set_urls(prev_prev_url, prev_url, next_url, next_next_url);
       if(this.articles_index >= 1){
         this.articles_index = this.articles_index - 1;
       }
     }else{
       var prev_prev_url = this.get_url_and_validate_index(this.articles_index - 1);
       var prev_url = this.get_url_and_validate_index(this.articles_index );
       var next_url = this.get_url_and_validate_index(this.articles_index + 2);
       var next_next_url = this.get_url_and_validate_index(this.articles_index + 3);
       this.set_urls(prev_prev_url, prev_url, next_url, next_next_url);
       if(this.articles_index <= this.articleIndexs.length - 2){
          this.articles_index = this.articles_index + 1;
        }
     }
     
   },
   
   get_url_and_validate_index : function(index){
     if(index < 0){
       return '#';
     }else if(index >= this.articleIndexs.length){
       return '#';
     }else{
       return this.articleIndexs[index];
     }
     return '';
   },
   
   set_urls : function(prev_prev_url, prev_url, next_url, next_next_url){
     this.nav_prev.set({'article_id': prev_url, 'prev_id' : prev_prev_url, 'next_id' : next_url});
     this.nav_next.set({'article_id': next_url, 'prev_id' : prev_url, 'next_id' : next_next_url});
   },
   
   setArticles : function(){
     this.array_articleIndexs();
     if(this.articleIndexs.length > 0 ){
       if(this.article_id){
         this.options.articles_index = _.indexOf(this.articleIndexs, this.article_id);
         this.articles_index = this.options.articles_index;
       }else{
         this.articles_index = this.options.articles_index;
         this.model.id = this.articleIndexs[this.articles_index];
         this.model.fetch();
       }
       var prev_prev_url = this.get_url_and_validate_index(this.articles_index - 2);
       var prev_url = this.get_url_and_validate_index(this.articles_index - 1);
       var next_url = this.get_url_and_validate_index(this.articles_index + 1);
       var next_next_url = this.get_url_and_validate_index(this.articles_index + 2);
       this.set_urls(prev_prev_url, prev_url, next_url, next_next_url);      
     }

   },
   
   array_articleIndexs : function(){
     if(! _.isArray(this.articleIndexs)){
       this.articleIndexs = _.toArray(this.articleIndexs.attributes);
     }
   },
  
   set_article_id : function(article_id){
     this.article_id = article_id;
   }
 });

 window.ArticleView = Backbone.View.extend({
   
   template: "#article-template",

   className: 'article',
   
   initialize : function(){
     _.bindAll(this, 'render', 'initializeTemplate', 'render');
     this.initializeTemplate();
     this.model.bind('change', this.render, this);
   },

   initializeTemplate: function(){
     this.template = _.template($(this.template).html());
   },
   
   render : function(){
     $(this.el).html(this.template(this.model.toJSON()));
     if($('form.delete_article') && this.model.id){
       $('form.delete_article').attr('action', this.model.url());
       $('form #rev').attr('value', this.model.get('_rev'));
     }
     return this;
   }
 });
 
 window.Action = Backbone.View.extend({
   template : '#action-template',
   
   tagName : 'li',
   
   initializeTemplate: function(){
       this.template = _.template($(this.template).html());
    },
 });
 
 window.Comment_Action = window.Action.extend({
   
   className : 'comment',

   initialize : function(){
      _.bindAll(this, 'render', 'initializeTemplate', 'render');
      this.initializeTemplate();
      this.model.bind('change', this.render, this);
   },
   
   render    : function(){
      var url = {};
      url.url = '#!/articles/' + this.model.id + '/comments';
      $(this.el).html(this.template(url));
      return this;
    },
 });
 
 window.CommentsView = Backbone.View.extend({
   
   template : '#comments-template',
   
   initialize : function(){
     _.bindAll(this, 'render');
     this.initializeTemplate();
     this.collection.bind('reset', this.render, this);
   },
   
   render : function(){
     $(this.el).html(this.template());
     _.each(this.collection.models, function(comment){
       commentView = new CommentView({model : comment}); 
       $('#comments').append(commentView.render().el);
     });
     
     $('.new_comment #article_id').attr('value', this.collection.article.id);
     $('.new_comment').attr('action', 'articles/' + this.collection.article.id + '/comments');
     return this;
   },
   
   initializeTemplate: function(){
     this.template = _.template($(this.template).html());
   }
 });
 
 window.CommentView = Backbone.View.extend({
   
   template : '#comment-template',
   
   className : 'comment',
   
   tagName : 'li',
   
   initialize : function(){
      _.bindAll(this, 'render', 'initializeTemplate', 'render');
      this.initializeTemplate();
      this.model.bind('change', this.render, this);
    },

   initializeTemplate: function(){
     this.template = _.template($(this.template).html());
   },

   render : function(){
     $(this.el).html(this.template(this.model.toJSON()));
     return this;
   }
 });