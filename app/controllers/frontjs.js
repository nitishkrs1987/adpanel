var pool = require('../lib/mysql_conn.js');
exports.index = function (req,res) {
  // console.log(req.params.campaign_id);
  if(typeof(req.params.campaign_id) != "undefined")
  {
     pool.query("select A.*,B.is_country_divided,B.name from images as A,campaign as B where A.campaign_id=B.id and A.campaign_id="+req.params.campaign_id,function(err,rows){
         if(!err) {
           console.log(rows);
           res.render('frontjs',{data: rows,campaign_id:req.params.campaign_id});
           
         }else{
          req.flash('error', JSON.stringify(err));
          res.redirect('/campaign');
         }
     });
  }
}
exports.save = function (req,res) {
  // console.log(upload.single('campaign_id'));
  console.log(req.files['image'][0]);
  if(typeof(req.body.campaign_id) != "undefined")
  {
    var ext = req.files['image'][0].mimetype.replace("image/","");
    var img_url = "https://www.clickscart.in/ads/ht/images/300x250/"+req.files['image'][0].filename+"."+ext;
    var insert_sql = "insert into frontjs (campaign_id,size,ga,link,image,is_clean,active) values ('"+req.body.campaign_id+"','"+req.body.size+"','"+req.body.ga+"','"+req.body.link+"','"+img_url+"',1,1 )";
    console.log(insert_sql);
    // pool.query(insert_sql,function(err,rows){
    //   if(!err) {
    //     req.flash('success', 'Added Successfully.');
    //     res.redirect('/campaign');
    //   }else{
    //     req.flash('error', 'Attention! Failed to add.');
    //     res.redirect('/campaign');  
    //   }
    // });
  }
}

