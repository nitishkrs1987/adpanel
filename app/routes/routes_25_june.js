var campaign_handler = require('../controllers/campaign')
var advertisor_handler = require('../controllers/advertisor')
var affiliate_handler = require('../controllers/affiliate')
var generate_handler = require('../controllers/generate')
var passport = require('passport');

module.exports = function (app) {

  app.get('/login', function (req, res) {
    res.render('home')
  });
  app.get('/', function (req, res) {
    res.redirect('/login');
  });
  app.post('/login',
      passport.authenticate('local', { failureRedirect: '/' }),
      function(req, res) {
        res.redirect('/campaign');
  });
    // app.get('/panel',require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
    //     res.render('panel')
    // });

    // app.get('/', function (req, res) {
    //     res.redirect('/campaign');
    // });
    app.get('/campaign',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.index);
    // app.get('/campaign',campaign_handler.index);
    app.get('/generate-file/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),generate_handler.index);
    app.get('/campaign/edit/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.edit);
    app.get('/campaign/add',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.add);
    app.post('/campaign/save',campaign_handler.save);

    app.get('/advertisor/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.index);
    app.get('/advertisor/add/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.add);
    app.post('/advertisor/save',advertisor_handler.save);
    app.get('/advertisor_detail/:adv_id',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.detail);

    app.get('/affiliate/:adv_id',require('connect-ensure-login').ensureLoggedIn(),affiliate_handler.index);
    app.post('/affiliate/save',affiliate_handler.save);
    app.get('/affiliate/remove/:affiliate_id',affiliate_handler.remove);
}
