exports.index = function(req, res){
  console.log(req.params.article_id);
  var docs = [];
  db_comments.view('comments/by_article_id', { key: req.params.article_id }, function(err, result) {
    if(err){
      console.log('errors fetching docs');
    }else{
      result.forEach(function(row){
        docs.push(row); 
      });
      res.send(docs);
    }
  });
  
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  console.log(req);
  
  var new_comment = {
    article_id: req.params.article_id,
    comment: req.body.comment,
    posted_on: Date(),
    date: Date().substring(0,15)
  };
      
  db_comments.save(new_comment.id, new_comment, function(err, doc){
    if(err){
      console.log(err);
    }else{
      console.log(doc);
    }
  });
  res.redirect("#!" + req.url);
};

exports.show = function(req, res){
  res.send('show forum ' + req.forum.title);
};

exports.edit = function(req, res){
  res.send('edit forum ' + req.forum.title);
};

exports.update = function(req, res){
  res.send('update forum ' + req.forum.title);
};

exports.destroy = function(req, res){
  res.send('destroy forum ' + req.forum.title);
};

exports.load = function(id, fn){
  process.nextTick(function(){
    fn(null, { title: 'Ferrets' });
  });
};