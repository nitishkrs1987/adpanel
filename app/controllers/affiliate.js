var pool = require('../lib/mysql_conn.js');
var comp_vendor = require('../models/product_model.js');

exports.index = function (req,res) {
  if(typeof(req.params.adv_id) != "undefined")
  {
    getRedirectUrl(req.params.adv_id,function(redir_url){
        pool.query("select * from affiliate where affiliate_type=0 and adv_id="+req.params.adv_id+" order by link desc",function(err,rows){
            if(!err) {
              res.render('affiliate',{affiliate: rows,adv_id: req.params.adv_id,redir_url:redir_url.redir_url,is_divisor_needed:redir_url.is_divisor_needed,adv_type:redir_url.type,campaign_id:redir_url.campaign_id});
            }
        });
    });
  } 
}
/*********** Insert Affiliates after deleting existing ones **********/
exports.save = function (req,res) {
  // console.log(req.body.redir_req);
  if(typeof(req.body.adv_id) != "undefined" && typeof(req.body.links) != "undefined")
  {
      var insert_sql = "";
      var check_dup_divisor = [];
      // if(typeof(req.body.multi_choice_prod) != "undefined")
      // {
      //   insert_sql += "insert into affiliate (adv_id,link,divisor,affiliate_type) values("+req.body.adv_id+",'multi_choice_prod',"+req.body.multi_choice_prod_divisor+",0 );";
      //   check_dup_divisor.push(parseInt(req.body.multi_choice_prod_divisor));
      // }
      for(var i=0;i<req.body.links.length;i++)
      { 
        if(req.body.links[i] != "")
        {
          if( req.body.redir_req[i] == 1)
            var link = req.body.redir_url+encodeURIComponent(req.body.links[i]);
          else
            var link = req.body.links[i];

          insert_sql += "insert into affiliate (adv_id,link,name,divisor,affiliate_type,redir_req) values("+req.body.adv_id+",'"+ link +"','"+ req.body.name[i]+"', "+req.body.divisor[i]+",0 ,"+ req.body.redir_req[i] +");";
          if(req.body.adv_type !=2)
          {
            check_dup_divisor.push(parseInt(req.body.divisor[i]));  
          }          
        }        
      }
      if(check_dup_divisor.length>0 && hasDuplicates(check_dup_divisor))
      {
        req.flash('error', "Duplicate Divisor");
        res.redirect('/advertisor/'+req.body.campaign_id);
      }else{
        // console.log(insert_sql);
        if(insert_sql != "")
        {
          pool.query("delete from affiliate where affiliate_type=0 and adv_id="+req.body.adv_id+";",function(del_err,del_rows){
            if(!del_err) {
              // console.log(insert_sql);
              pool.query(insert_sql,function(err,rows){
                if(!err) {
                  req.flash('success', 'Updated Successfully.');
                  res.redirect('/advertisor/'+req.body.campaign_id);
                }else{
                  // console.log(err);
                  req.flash('error', err.code);
                  res.redirect('/advertisor/'+req.body.campaign_id);
                }
              });
            }
          });
        }
      }
     
     
  } else{
    // console.log(err.code);
    req.flash('error', "Empty Value");
    res.redirect('/advertisor/'+req.body.campaign_id);
  }
}

/****** Remove individual affiliate URL *********/
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

/******** Update product link from mongodb for multi choose type advertisers *********/
exports.update_plinks = function(req,res){
  if(typeof(req.params.adv_id) != "undefined")
  {
    getRedirectUrl(req.params.adv_id,function(redir_url){
      var query = {};
      query["enabled"] = 1;
      query["track_stock"] = 1;
      query["vendor"] = redir_url.vendor;
      
      if(redir_url.country.toLowerCase() != "in")
      {
        var mongoose = require("../lib/mongo_conn_asean.js");
        query["country_code"] = redir_url.country.toLowerCase();
      } else{
        var mongoose = require("../lib/mongo_conn_india.js");
      }
      // comp_vendor.find({enabled: 1,track_stock: 1,vendor: redir_url.vendor,country_code: redir_url.country.toLowerCase()},'product_url').sort({'last_update': -1}).limit(parseInt(redir_url.product_count)).exec(function(err, links) 
      comp_vendor.find(query,'product_url').sort({'last_update': -1}).limit(parseInt(redir_url.product_count)).exec(function(err, links) 
      {
        if(err) {
          res.writeHead(200, {"Content-Type": "text/plain"});
          res.end("0");
        }else{
            var insert_sql = "";
            for(var i=0;i<links.length;i++)
            {
              p_url = redir_url.redir_url+encodeURIComponent(links[i].product_url.replace("http:","https:"))
              insert_sql += "insert into affiliate (adv_id,link,divisor,affiliate_type) values("+req.params.adv_id+",'"+ p_url +"',1,1 );";
            }
            // console.log(insert_sql);
            if(insert_sql != "")
            {
              pool.query("delete from affiliate where affiliate_type=1 and adv_id="+req.params.adv_id+";",function(del_err,del_rows){
                if(!del_err) {                  
                  pool.query(insert_sql,function(err,rows){
                    if(!err) {
                      res.writeHead(200, {"Content-Type": "text/plain"});
                      res.end("1");
                    }else{
                      res.writeHead(200, {"Content-Type": "text/plain"});
                      res.end("0");
                    }
                  });
                }
              });
            }else{
              res.writeHead(200, {"Content-Type": "text/plain"});
              res.end("0");
            }        
        }
      });
    });
    // console.log(req.params.adv_id);
  }
};

exports.isLinksGenerated = function(req,res){
  if(typeof(req.params.adv_id) != "undefined")
  {
    pool.query("select count(*) as count from affiliate where affiliate_type=1 and adv_id="+req.params.adv_id,function(err,rows){
      if(!err)
      {
        // console.log(rows[0].count);
        res.end(""+rows[0].count);
        
      }else{
        console.log(err);
        res.end("");
      }      
    });
  }
}



function getRedirectUrl(adv_id,callback) {
  pool.query("select A.is_divisor_needed,A.type,A.product_count,A.campaign_id, B.redir_url,A.vendor,A.country from advertisor as A,redirect_wrapper as B where A.redirect_id=B.redirect_id and A.adv_id="+adv_id,function(err,rows){
    if(!err)
    {
      // console.log(rows[0].redir_url);
      callback(rows[0]);
    }else{
      console.log(err);
      callback(false);
    }
    
  });
};
function hasDuplicates(array) {
  var valuesSoFar = Object.create(null);
  for (var i = 0; i < array.length; ++i) {
      var value = array[i];
      if (value in valuesSoFar) {
          return true;
      }
      valuesSoFar[value] = true;
  }
  return false;
}