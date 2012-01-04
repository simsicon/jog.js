exports.index = function(req, res){
  res.render('index', 
              { title: "Zenzlog", 
                username : req.session.username, 
                avatar_url : req.session.avatar_url,
                login : function() {
                  if(req.session.username){
                    return true;
                  }else{
                    return function(){
                      return "<span class='remarkable'><a href='/twitter/sessions/connect'><img width='70px' src='/images/logo_twitter_withbird_1000_allblack.png'></img></a></sapn>"
                    };
                  }
                  return false;
                },
                admin_actions : function() {
                  if(req.session.username){
                    return function(){
                      return "<div class='admin_actions'><form method='post' action='' class='delete_article'><input type='hidden' name='_method' value='delete' /><input type='hidden' id='rev' value='' /><button class='btn danger icon trash' type='submit'>delete</button></form></div>";
                    };
                  }else{
                    return false;
                  }
                  return false;
                } 
              })
};

exports.connect = function(req, res){
  db_meta.get('twitter_doc', function(err, doc){
    if(doc && doc.twitter_id){
      consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
        console.log(error)
        if (error) {
          res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
        } else {
          console.log("oauth token :" + oauthToken);
          console.log("oauth token secret:" + oauthTokenSecret);
          req.session.oauthRequestToken = oauthToken;
          req.session.oauthRequestTokenSecret = oauthTokenSecret;
          redir_url = '';
          if(global.process.env.NODE_ENV == 'development'){
            redir_url = "https://api.twitter.com/oauth/authorize?oauth_callback=http://localhost:3000/twitter/sessions/callback&oauth_token="
          }else{
            redir_url = "https://api.twitter.com/oauth/authorize?oauth_callback=http://zenzlog.com/twitter/sessions/callback&oauth_token="
          }
          res.redirect(redir_url +req.session.oauthRequestToken);
        }
      }); 
    }else{
      res.redirect('/admin');
    }
  });
};

exports.callback = function(req, res){
	consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      // Right here is where we would write out some nice user stuff
      consumer().get("https://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
        data = JSON.parse(data)
        if (error) {
          res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
        } else {
          db_meta.get('twitter_doc', function(err, doc){
            if (data["id"] == doc.twitter_id) {
              req.session.username = data["screen_name"];
              req.session.avatar_url = data["profile_image_url"];
            } else {
              req.session.username = "";
              req.session.avatar_url = "";
            }
          });
          
          res.redirect('/');
        }
      });
    }
  });
};


exports.logout = function(req, res){
  req.session.username = "";
  req.session.avatar_url = "";
  res.redirect('/');
};

exports.verify_credentials = function(req, res){
  var vc = {};
  if(req.session.username){
    vc = {username : req.session.username};
  }else{
    vc = {error : "you are not authorized"};
  }
  res.send(vc);
};

exports.sign_in = function(req, res){
  req.session.username = "simsicon";
  req.session.avatar_url = "/images/wukong.jpg";
  res.redirect('/');
};

exports.admin = function(req, res){
  db_meta.view('meta/all', function(err, result) {
     if(err){
      console.log("________err");
      console.log(err);
    }else{
      var docs = [];
      result.forEach(function(row){
        docs.push(row); 
      });
      if(req.session.username || docs.length == 0){
        res.render('admin', docs[0]);
      }else{
        res.redirect('/');
      }
    }
  });
};

exports.update_admin = function(req, res){
  db_meta.get('twitter_doc', function(err, doc){
    twitter_doc = {}
    if(doc){
      twitter_doc = doc
    }else{
      twitter_doc = {twitter_id : ''}
    }
    if(req.body.twitter_account_id){
      twitter_doc.twitter_id = req.body.twitter_account_id
      db_meta.save('twitter_doc', twitter_doc, function(err, res){
        if(err){
          twitter_doc.notice = "UPDATE UNSUCCESSFUL"
        } else {
          twitter_doc.notice = "UPDATE SUCCESSFUL"
        }
      });
    }else{
      twitter_doc.notice = "TWITTER ACCOUNT ID CAN'T BE BLANK"
    }
    
    res.render('admin', twitter_doc);
  });
  
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

exports.article_indexs = function(req, res){
  get_articles(function(articles){
    var article_index = [];
    _.each(articles, function(article){
      article_index.push(article.id);
    });
    res.send(article_index);
  });
};


var host_url = function(){
  url = '';
  if(global.process.env.NODE_ENV == 'development'){
    url = "http://localhost:3000"
  }else{
    url = "http://zenzlog.com"
  } 
  return url
};

var consumer = function() {
  return new oauth.OAuth("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token",
    config.twitter.key, config.twitter.secret, "1.0", host_url() + "/twitter/sessions/callback", "HMAC-SHA1");
};


var get_articles = function(callback){
  var docs = [];
  db_articles.view('articles/by_date', {descending: true}, function(err, result) {
    if(err){
    }else{
      result.forEach(function(row){
        docs.push(row); 
      });
      callback(docs)
    }
  });
};

slugify = function(url, text) {
  if(typeof url == 'undefined' || url == ''){
    newtext = text;
    newtext = newtext.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
    newtext = newtext.replace(/-/gi, "_");
  	newtext = newtext.replace(/\s/gi, "-");
  	if(newtext == ''){
  	  console.log("empty string!!!");
  	  console.log(newtext);
  	  var random_ary = ['northern', 'light', 'beatles', 'bob', 'dylan', 'blueberry', 'skunk', 'thai', 'kush', 'afghan'];
  	  d = new Date();
  	  newtext = d.toFormat('YYYYMMDDHH24MISS') + random_ary[Math.floor(Math.random()*10)]
  	  console.log(newtext);
  	}
  	return newtext;
  }else{
   return url; 
  }
}