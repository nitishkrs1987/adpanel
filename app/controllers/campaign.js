var pool = require('../lib/mysql_conn.js');
var logger = require('../lib/logger.js');
exports.index = function (req,res) {
  pool.query("select * from campaign",function(err,rows){
       if(!err) {
         // console.log(rows);         
         res.render('campaign',{campaign: rows,req:req,res:res});
       }
   });
}
exports.edit = function (req,res) {
  pool.query("select * from campaign where id="+req.params.campaign_id,function(err,rows){
       if(!err) {
         res.render('campaign_edit',{campaign: rows[0],add: false});
       }
   });
}
exports.add = function (req,res) {
  res.render('campaign_edit',{add: true});
}
exports.save = function (req,res) {
  // console.log(req.body);  
  if(typeof(req.body.id) == "undefined")
  {    
    // var insert_sql = "insert into campaign (name,is_country_divided,country,type,active) values ('"+req.body.name+"', '"+req.body.country+"',"+req.body.is_country_divided+","+req.body.type+","+req.body.active+" )";
    var insert_sql = "insert into campaign set ";
    var req_data = req.body;
    for (let key in req_data)
    {
      insert_sql += key+"='"+req_data[key]+"',"
    }
    insert_sql = insert_sql.slice(0, -1);
    // console.log(insert_sql);
    pool.query(insert_sql,function(err,rows){
      if(!err) {
        logger.log("campaign added",req.cookies.username,rows.insertId);
        req.flash('success', 'Added Successfully.');  
        res.redirect('/campaign');
      }else{
        req.flash('error', 'Attention! Fail to add.'+err);
        res.redirect('/campaign');  
      }
    });
  }else{
    logger.log("campaign edit",req.cookies.username,req.body.id);
    // var update_sql = "update campaign set name = '"+req.body.name+"', country = '"+req.body.country+"', is_country_divided = "+req.body.is_country_divided+", type="+ req.body.type+", active= "+req.body.active+" where id="+req.body.id;
    var update_sql = "update campaign set ";
    var req_data = req.body;
    for (let key in req_data)
    {
      update_sql += key+"='"+req_data[key]+"',"
    }
    update_sql = update_sql.slice(0, -1);
    update_sql += " where id="+req.body.id;
    // console.log(update_sql);
    pool.query(update_sql,function(err,rows){
      if(!err) {        
        req.flash('success', 'Updated Successfully.');
        res.redirect('/campaign');        
      }else{
        req.flash('error', 'Attention! Failed to update.');
        res.redirect('/campaign');  
      }
    });
  }
}
