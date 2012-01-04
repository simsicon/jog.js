db_meta =  conn.database('meta');
db_articles = conn.database('articles');
db_comments = conn.database('comments');
 
db_meta.exists(function(err, exists){
  if (err) {
    console.log('error', err);
  } else if (exists) {
    console.log('meta the force is with you.'); 
  } else {
    console.log('database does not exists.');
    db_meta.create(function(){
      console.log('successfully created db_meta');
      db_meta.save('_design/meta', {
        all: {
          map: function (doc) { emit(doc._id, doc);}
        }
      });
      console.log('successfully created views of db_meta');
    });
  }
});

db_articles.exists(function (err, exists) {
    if (err) {
      console.log('error', err);
    } else if (exists) {
      console.log('articles the force is with you.');
    } else {
      console.log('database does not exists.');
      db_articles.create(function(){
        console.log('successfully created db_articles');
        db_articles.save('_design/articles', {
              all: {
                map: function (doc) { emit(doc._id, doc);}
              },
              by_date: {
                map: function(doc) { emit([doc.posted_on, doc.title], doc);}
              }
        });
        console.log('successfully created views of db_articles');
      });
    }
});

db_comments.exists(function (err, exists) {
    if (err) {
      console.log('error', err);
    } else if (exists) {
      console.log('comments the force is with you.');
    } else {
      console.log('database does not exists.');
      db_comments.create(function(){
        console.log('successfully created db_articles');
        db_comments.save('_design/comments', {
              all: {
                map: function (doc) { emit(doc._id, doc);}
              },
              by_article_id: {
                map: function(doc) {
                  emit(doc.article_id, doc);
                }
              }
        });
        console.log('successfully created views of db_comments');
      });
    }
});