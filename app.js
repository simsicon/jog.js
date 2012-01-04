
/**
 * Module dependencies.
 */

express = require('express')
, routes = require('./routes')
, stache = require('stache')
, cradle = require('cradle')
, sys  = require('util')
, oauth = require('oauth')
, config = require('./config/config.js')
, date = require('date-utils')
, _ = require('underscore')
, Resource = require('express-resource');

conn = null;

if(global.process.env.NODE_ENV == 'development'){
  
}else if(global.process.env.NODE_ENV == 'production'){
  cradle.setup({
      host: 'your host',
      cache: true, 
      raw: false,
      secure: true,
      auth: { username: 'your user name', password: 'your pwd' }
  });
}

conn = new(cradle.Connection)();

db = require('./db');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'mustache');
  app.register('.mustache', stache);
  app.use(express.cookieParser());
  app.use(express.session({ secret: "string" }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

app.resource('articles', require('./routes/article'));
app.resource('articles/:article_id/comments', require('./routes/comment'));

app.get('/', routes.index);
app.get('/twitter/sessions/connect', routes.connect);
app.get('/twitter/sessions/callback', routes.callback);
//app.get('/sign_in', routes.sign_in);
app.get('/admin', routes.admin);
app.get('/account/verify_credentials', routes.verify_credentials);
app.get('/verify_credentials', routes.verify_credentials);
app.get('/logout', routes.logout);
app.get('/latest_articleid', routes.latest_articleid);
app.get('/article_indexs', routes.article_indexs);
// Routes

app.listen(parseInt(process.env.PORT || 3000));
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
