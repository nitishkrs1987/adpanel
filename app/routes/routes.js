var env = process.env.NODE_ENV || 'development';
var campaign_handler = require('../controllers/campaign')
var advertisor_handler = require('../controllers/advertisor')
var affiliate_handler = require('../controllers/affiliate')
var ftp_handler = require('../controllers/ftp')
// var frontjs_handler = require('../controllers/frontjs')
var generate_handler = require('../controllers/generate')
var logger = require('../lib/logger');
// var exp_handler = require('../controllers/exp')
var passport = require('passport');
// const multer = require('multer');
// const upload = multer({ dest: 'output/images/' });
const path = require('path');
// var upload = multer({
//   dest: __dirname + 'uploads/',
//   limits: {fileSize: 1000000, files:1},
// })
module.exports = function (app) {
  app.get('/logout', function(req, res){
    res.clearCookie("username");
    req.logout();
    res.redirect('/');
  });
  if ('production' === env) {
    app.get('/login', function (req, res) {
      res.render('login')
    });
    app.get('/', function (req, res) {
      res.redirect('/login');
    });
    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),
        function(req, res) {
          // console.log(req.user.id);
          res.cookie('username',req.user.username, { maxAge: 180000000, httpOnly: true });
          res.redirect('/campaign');
    });
    app.get('/campaign',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.index);
    app.get('/campaign/edit/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.edit);
    app.get('/generate-file/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),generate_handler.index);
    app.get('/campaign/add',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.add);
    app.post('/campaign/save',require('connect-ensure-login').ensureLoggedIn(),campaign_handler.save);
    app.get('/advertisor/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.index);
    app.get('/advertisor/add/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.add);
    app.post('/advertisor/save',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.save);
    app.get('/advertisor_detail/:adv_id',require('connect-ensure-login').ensureLoggedIn(),advertisor_handler.detail);
    app.get('/affiliate/:adv_id',require('connect-ensure-login').ensureLoggedIn(),affiliate_handler.index);
    app.post('/affiliate/save',require('connect-ensure-login').ensureLoggedIn(),affiliate_handler.save);
    app.get('/affiliate/remove/:affiliate_id',require('connect-ensure-login').ensureLoggedIn(),affiliate_handler.remove);
    app.get('/files_in_output',require('connect-ensure-login').ensureLoggedIn(),generate_handler.files_in_output);
    app.get('/update_plinks/:adv_id',require('connect-ensure-login').ensureLoggedIn(),affiliate_handler.update_plinks);
    app.get('/affiliate/isLinksGenerated/:adv_id',require('connect-ensure-login').ensureLoggedIn(),affiliate_handler.isLinksGenerated);
    app.get('/ftp-upload-file/:campaign_id',require('connect-ensure-login').ensureLoggedIn(),ftp_handler.ftp_upload_file);
  }else{
    app.get('/', function (req, res, next) {
        res.redirect('/campaign');
    });

    // define a route to download a file
    app.get('/output/:file(*)',(req, res) => {
      var file = req.params.file;
      var fileLocation = path.join('./output',file);
      // console.log(fileLocation);
      res.download(fileLocation, file);
    });

    app.get('/campaign',campaign_handler.index);
    app.get('/campaign/edit/:campaign_id',campaign_handler.edit);
    app.get('/generate-file/:campaign_id',generate_handler.index);
    app.get('/campaign/add',campaign_handler.add);
    app.post('/campaign/save',campaign_handler.save);
    app.get('/advertisor/:campaign_id',advertisor_handler.index);
    app.get('/advertisor/add/:campaign_id',advertisor_handler.add);
    app.post('/advertisor/save',advertisor_handler.save);
    app.get('/advertisor_detail/:adv_id',advertisor_handler.detail);
    app.get('/affiliate/:adv_id',affiliate_handler.index);
    app.post('/affiliate/save',affiliate_handler.save);
    app.get('/affiliate/remove/:affiliate_id',affiliate_handler.remove);
    app.get('/files_in_output',generate_handler.files_in_output);
    app.get('/update_plinks/:adv_id',affiliate_handler.update_plinks);
    app.get('/affiliate/isLinksGenerated/:adv_id',affiliate_handler.isLinksGenerated);
    app.get('/ftp-upload-file/:campaign_id',ftp_handler.ftp_upload_file);

    // app.get('/frontjs/:campaign_id',frontjs_handler.index);

    // var cpUpload = upload.fields([{ name: 'campaign_id', maxCount: 1 }, { name: 'link', maxCount: 1 },{ name: 'size', maxCount: 1 },{ name: 'image', maxCount: 1 }, { name: 'ga', maxCount: 1 }]);
    // app.post('/frontjs/save',cpUpload,frontjs_handler.save);
    // app.post('/frontjs/save',cpUpload, function(req, res,next) {
    //   console.log(req.files['image'][0]);
    // });
  }


}
