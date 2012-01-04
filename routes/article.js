exports.index = function(req, res){
  res.send('forum index');
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  if(req.session.username){

    var new_article = {
      id: slugify(req.body.url, req.body.title),
      title: req.body.title,
      content: req.body.content,
      posted_on: Date(),
      date: Date().substring(0,15)
    };
    
    db_articles.save(new_article.id, new_article, function(err, doc){
      if(err){
        console.log(err);
      }else{
        console.log(doc);
      }
    });

  }else{
    res.send({error : "you are not authorized"});
  }
  res.redirect('/');
};

exports.show = function(req, res){
  console.log(req.params);
  db_articles.get(req.params.article, function(err, doc){
    res.send(doc);
  });
};

exports.edit = function(req, res){
  res.send('edit forum ' + req.forum.title);
};

exports.update = function(req, res){
  res.send('update forum ' + req.forum.title);
};

exports.destroy = function(req, res){
  if(req.session.username){
    console.log(req.params);
    db_articles.remove(req.params.article, req.params._rev, function (err, res) {
      console.log(err);
      console.log(res);
          // Handle response
    });
  };
  res.redirect('/');
};

exports.load = function(id, fn){
  process.nextTick(function(){
    fn(null, { title: 'Ferrets' });
  });
};
