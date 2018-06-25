const mysql      = require('mysql');

var pool = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE,
  multipleStatements: true
});

exports.index = function (req,res) {
  // console.log(req.params.adv_id);
  if(typeof(req.params.adv_id) != "undefined")
  {
    getRedirectUrl(req.params.adv_id,function(redir_url){
        pool.query("select * from affiliate where adv_id="+req.params.adv_id,function(err,rows){
            // connection.release();
            if(!err) {
              res.render('affiliate',{affiliate: rows,adv_id: req.params.adv_id,redir_url:redir_url.redir_url,is_divisor_needed:redir_url.is_divisor_needed,adv_type:redir_url.type,campaign_id:redir_url.campaign_id});
            }
        });
    });
  } 
}
exports.save = function (req,res) {
  // console.log(req.body);
  if(typeof(req.body.adv_id) != "undefined")
  { 
      var insert_sql = "";
      for(var i=0;i<req.body.links.length;i++)
      { 
        if(req.body.links[i] != "")
        {
          var link = req.body.redir_url+encodeURIComponent(req.body.links[i]);
          insert_sql += "insert into affiliate (adv_id,link,divisor) values("+req.body.adv_id+",'"+ link +"',"+req.body.divisor[i]+" );";
        }        
      }
        
      if(insert_sql != "")
      {
        pool.query("delete from affiliate where adv_id="+req.body.adv_id+";",function(del_err,del_rows){
          if(!del_err) {
            console.log(insert_sql);
            pool.query(insert_sql,function(err,rows){
              if(!err) {
                req.flash('success', 'Updated Successfully.');
                res.redirect('/advertisor/'+req.body.campaign_id);
              }else{
                // console.log(err.code);
                req.flash('error', err.code);
                res.redirect('/advertisor/'+req.body.campaign_id);
              }
            });
          }
        });
      }
     
  } 
}

exports.remove = function (req,res) {
  if(typeof(req.params.affiliate_id) != "undefined")
  {
    pool.query("delete from affiliate where affiliate_id="+req.params.affiliate_id+";",function(del_err,del_rows){
      if(!del_err) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("1");
      }
    });
  }
}



function getRedirectUrl(adv_id,callback) {
  pool.query("select A.is_divisor_needed,A.type,A.campaign_id, B.redir_url from advertisor as A,redirect_wrapper as B where A.redirect_id=B.redirect_id and A.adv_id="+adv_id,function(err,rows){
    if(!err)
    {
      // console.log(rows[0].redir_url);
      callback(rows[0]);
    }else{
      callback(false);
    }
    
  });
};