const express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var dotenv = require('dotenv')
var path = require('path');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var flash = require('connect-flash');
const app = express();
var http = require('http').Server(app)
var helmet = require('helmet')


dotenv.load()
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
// parsing
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing url encoded

//Cookies and Session
// app.use(require('morgan')('combined'));
app.use(cookieParser("india.@$shopps#!"));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({cookie: { maxAge: 60000000 }, secret: 'india.@$shopps#!', resave: false, saveUninitialized: false }));

app.use(helmet())
// app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
// routes
require('./app/routes/routes')(app)
app.set('port', 3000)
http.listen(app.get('port'), function () {
  // console.log('listening on port ' + app.get('port'))
});

//Login ====================================================

passport.use(new Strategy(
  function(username, password, cb) {
      db.users.findByUsername(username, function(err, user) {
          if (err) { return cb(err); }
          if (!user) { return cb(null, false); }
          if (user.password != password) { return cb(null, false); }
          return cb(null, user);
      });
  }));


passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
  });
});
