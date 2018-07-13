const mysql      = require('mysql');
// var pjson = require('./package.json');
var pool = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});
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
    var insert_sql = "insert into campaign (name,is_country_divided,country,type,active) values ('"+req.body.name+"', '"+req.body.country+"',"+req.body.is_country_divided+","+req.body.type+","+req.body.active+" )";
    // console.log(insert_sql);
    pool.query(insert_sql,function(err,rows){
      if(!err) {
        req.flash('success', 'Added Successfully.');  
        res.redirect('/campaign');
      }else{
        req.flash('error', 'Attention! Fail to add.'+err);
        res.redirect('/campaign');  
      }
    });
  }else{
    var update_sql = "update campaign set name = '"+req.body.name+"', country = '"+req.body.country+"', is_country_divided = "+req.body.is_country_divided+", type="+ req.body.type+", active= "+req.body.active+" where id="+req.body.id;
    // console.log(update_sql);
    pool.query(update_sql,function(err,rows){
      if(!err) {        
        req.flash('success', 'Updated Successfully.');
        res.redirect('/campaign');        
      }else{
        req.flash('error', 'Attention! Fail to update.');
        res.redirect('/campaign');  
      }
    });
  }
}
