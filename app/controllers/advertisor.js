const mysql      = require('mysql');
var pool = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});
exports.index = function (req,res) {
  // console.log(req.params.campaign_id);
  if(typeof(req.params.campaign_id) != "undefined")
  {
     pool.query("select A.*,B.is_country_divided,B.name from advertisor as A,campaign as B where A.campaign_id=B.id and A.campaign_id="+req.params.campaign_id,function(err,rows){     
         if(!err) {
          //  console.log(rows);
            if(rows.length > 0)
            {
              
              if(rows[0].is_country_divided ==1)  //check if campaign is divided in country
              {
                country = new Array();
                for(var i=0,k=0; i<rows.length; i++)
                {
                  if(country.indexOf(rows[i].country) == -1)
                  {
                    country[k] = rows[i].country;
                    k++;
                  }                
                }
                // console.log(country);
                res.render('advertisor',{advertisor: rows,country:country});
              }else{
                res.render('advertisor',{advertisor: rows});
              }
                
            }else{
              req.flash('error', 'First add advertisors here.');
              res.redirect('/campaign');
            }           
         }else{
          req.flash('error', JSON.stringify(err));
          res.redirect('/campaign');
         }
     });
  } 
}
exports.detail = function(req, res){
  if(typeof(req.params.adv_id) != "undefined")
  {
     pool.query("select A.*,C.is_country_divided,C.country as camp_country,C.type as camp_type from advertisor as A, campaign C where A.campaign_id=C.id  and A.adv_id="+req.params.adv_id,function(err,rows){
      pool.query("select * from redirect_wrapper",function(err,redirect_data){
         if(!err) {
          //  console.log(rows);
           res.render('advertisor_detail',{advertisor: rows[0], add:false,redirect_data:redirect_data});
         }
      });
     });
  } 
}
exports.add = function(req, res){
  if(typeof(req.params.campaign_id) != "undefined")
  {
    pool.query("select id, name, country as camp_country, is_country_divided, type as camp_type, active from campaign where id="+req.params.campaign_id,function(err,campaign_detail){
      pool.query("select * from redirect_wrapper",function(err,redirect_data){
        if(!err) {
          res.render('advertisor_detail',{advertisor: campaign_detail[0],add: true,redirect_data:redirect_data});
        }
      });
    });
  } 
}
exports.save = function(req, res){
  // Insert
  if(typeof(req.body.campaign_id) != "undefined")
  {
    var insert_sql = "insert into advertisor (adv_name,vendor,campaign_id,enabled_time,country,redirect_id,is_divisor_needed,type,is_bounce_req,bounce_frame_id,bounce_url,active) values ('"+req.body.adv_name+"',"+req.body.vendor+","+req.body.campaign_id+","+req.body.enabled_time+",'"+req.body.country+"',"+req.body.redirect_id+","+req.body.is_divisor_needed+","+req.body.type+","+req.body.is_bounce_req+",'"+req.body.bounce_frame_id+"', '"+req.body.bounce_url+"', "+req.body.active+" )";
    // console.log(insert_sql);
    pool.query(insert_sql,function(err,rows){
      if(!err) {
        req.flash('success', 'Added Successfully.');
        res.redirect('/campaign');
      }else{
        console.log(err);
        req.flash('error', 'Attention! Failed to add.'+err);
        res.redirect('/campaign');  
      }
    });
  }
  
  //Edit
  if(typeof(req.body.advertisor_id) != "undefined")
  {
    var enabled_time = parseInt(req.body.enabled_time.split(" ")[0])
    var update_sql = "update advertisor set adv_name='"+req.body.adv_name+"', vendor="+req.body.vendor+", enabled_time="+enabled_time+", country='"+req.body.country+"',redirect_id="+req.body.redirect_id+", is_divisor_needed="+req.body.is_divisor_needed+", active="+req.body.active+", type="+req.body.type+", is_bounce_req="+req.body.is_bounce_req+", bounce_frame_id='"+req.body.bounce_frame_id+"', bounce_url='"+req.body.bounce_url+"' where adv_id="+req.body.advertisor_id;
    // console.log(update_sql);
    pool.query(update_sql,function(err,rows){
      if(!err) {
        req.flash('success', 'Updated Successfully.');
        res.redirect('/advertisor/'+req.body.camp_id);
      }else{
        req.flash('error', 'Attention! Failed to edit.'+err);
        res.redirect('/advertisor/'+req.body.camp_id);
      }
    });
  }
  
}