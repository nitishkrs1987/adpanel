const mysql      = require('mysql');
var pool = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});
exports.index = function (req,res) {
  // console.log(req.params.campaign_id);
  
  pool.query("select * from campaign where id="+req.params.campaign_id,function(err,rows){
    if(!err) {
      if(rows[0].is_country_divided == 0)
      {
        unicountry(rows[0].id,function(resp){
          res.render("generate",{generate:resp});
        });
      }
    }
  });
  
}
function unicountry(campaign_id,callback)
{
  var generate = "var a = Math.round(new Date().getTime() / 1000);";
  pool.query("select * from advertisor A, affiliate B where A.adv_id=B.adv_id and A.active=1 and campaign_id="+campaign_id,function(err,rows){
    if(!err) {
      generate += 'var e = ""';
      for(i=0; i <rows.length;i++)
      {
        generate += "var "+rows[i].adv_name.toLowerCase()+"_time =(parseInt(a) + ("+rows[i].enabled_time+" * 60 * 60));";
        cookie_custom_name = rows[i].adv_name.toLowerCase().replace("a","").replace("e","").replace("o","");

        generate += "if (typeof(localStorage['"+cookie_custom_name+"']) == 'undefined' || localStorage['"+cookie_custom_name+"'] <= a) {";
        generate += " localStorage['"+cookie_custom_name+"'] = "+rows[i].adv_name.toLowerCase()+"_time;";
        if(rows[i].is_divisor_needed == 0)  //Not dividing in numbers
        {
          // console.log("38-"+rows[i].adv_id);
          generate += "e += \"<iframe src='"+rows[i].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
         
        }else{
          generate += "var f = Math.floor(Date.now() / 1000);";
          if(i == 0)
          {
            generate += "if (f % "+rows[i].divisor+" == 0) {";
          }else if(rows[i].divisor > 1){
            generate += "} else if (f % "+rows[i].divisor+" == 0) {";
          }else if(rows[i].divisor == 1){
            generate += "} else {";
          }
          
          generate += "e += \"<iframe src='"+rows[i].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
          generate += "}";
        }
        


        generate += "}";
      }

      callback(generate);
    }
  });  
}

// function single_affiliate(adv_id,callback){
//   var affiliate = "";
//   pool.query("select * from affiliate where adv_id="+adv_id,function(aff_err,affiliate_row){
//     if(!aff_err) {
//       if(affiliate_row.length > 0)
//       {
//         console.log("43-"+JSON.stringify(affiliate_row[0]));
//         console.log("44-"+affiliate_row[0].link);
//         affiliate += "e += \"<iframe src='"+affiliate_row[0].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
//       }
//       callback(affiliate);
//     }
//   });
// }
