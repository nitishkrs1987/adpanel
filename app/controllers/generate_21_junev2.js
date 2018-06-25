const mysql      = require('mysql');
const fs = require('fs');
class Database {
  constructor( config ) {
      this.connection = mysql.createConnection( {
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DATABASE
      } );
  }
  query( sql, args ) {
      return new Promise( ( resolve, reject ) => {
          this.connection.query( sql, args, ( err, rows ) => {
              if ( err )
                  return reject( err );
              resolve( rows );
          } );
      } );
  }
  close() {
      return new Promise( ( resolve, reject ) => {
          this.connection.end( err => {
              if ( err )
                  return reject( err );
              resolve();
          } );
      } );
  }
}
exports.index = function (req,res) {
  // console.log(req.params.campaign_id);
  database = new Database();
  
  database.query( 'select * from campaign where id='+req.params.campaign_id ).then( rows => {
    if(rows[0].is_country_divided == 0)
        {
          var filename = "output/promo_img.js";
          unicountry(rows[0].id,function(resp){
            // res.render("generate",{generate:resp});
            fs.unlink(filename, function (err) {
              fs.writeFile(filename, resp, function(err) {
                if(err) {
                    return console.log(err);
                }
                res.download(filename);
                // res.render("generate",{generate:resp});
              }); 
            });
          }); 
        }else{     
          var filename = "output/promo_img_"; 
          // var output = {};   
          
          database.query("select country from advertisor where active=1 and campaign_id="+rows[0].id+" group by country").then( country => {
            for(i=0; i <country.length;i++)
            {
              multicountry(rows[0].id,country[i].country.toLowerCase(),function(resp){
                // console.log(resp);
                for (var country in resp) {
                  // console.log(country);
                   fs.unlink(filename+country+".js", function (err) {
                    fs.writeFile(filename+country+".js", resp[country], function(err) {
                      if(err) {
                          return console.log(err);
                      }
                      res.download(filename+country+".js");
                      // res.render("generate",{generate:resp});
                    }); 
                  });     
              }
                // res.render("generate",{generate:resp});    
                  
              });
            }
             
          });
          
          // .then( () => {
          //   console.log("advertisor-"+JSON.stringify(output));
          //   res.render("generate",{generate:JSON.stringify(output)});   
          // }); 
        }
  });
}

function multicountry(campaign_id,country,callback)
{
  database = new Database();
  var advertisor = {};
  var affiliate = {};
  
  database.query("select * from advertisor where active=1 and country like '"+country+"' and campaign_id="+campaign_id).then( rows => {
    // advertisor = rows;
    advertisor[country] = rows;    
    var ids= "";
    for(i=0; i <advertisor[country].length;i++)
    {
     ids += advertisor[country][i].adv_id+",";
    }    
    if(ids != "")
    {
      ids = ids.slice(0, -1);
      // console.log("78-"+ids);
      return database.query( "select * from affiliate where adv_id in ("+ids+")" );
    }
  }).then( rows => {
    // affiliate = rows;
    affiliate[country] = rows;
    // return database.close();
  }, err => {
    return database.close().then( () => { throw err; } )
} )
  .then( () => {
    // console.log("country-"+country);
    // console.log("advertisor-"+JSON.stringify(advertisor));
    // console.log("affiliate-"+JSON.stringify(affiliate));
    generate_js(advertisor[country],affiliate[country],country,function(resp){
     callback(resp);
      // console.log("resp-"+resp);
    });
  } ).catch( err => {
    // handle the error
    console.log(err);
  } );  
}


function generate_js(advertisor,affiliate,country,callback ){
  var generate = "var a = Math.round(new Date().getTime() / 1000);";
  generate += 'var e = "";';
      for(i=0; i <advertisor.length;i++)
      {
        generate += "var "+advertisor[i].adv_name.toLowerCase()+"_time =(parseInt(a) + ("+advertisor[i].enabled_time+" * 60 * 60));";
        cookie_custom_name = advertisor[i].adv_name.toLowerCase().replace("a","").replace("e","").replace("o","");

        generate += "if (typeof(localStorage['"+cookie_custom_name+"']) == 'undefined' || localStorage['"+cookie_custom_name+"'] <= a) {";
        generate += " localStorage['"+cookie_custom_name+"'] = "+advertisor[i].adv_name.toLowerCase()+"_time;";
        if(advertisor[i].is_divisor_needed == 0)  //Not dividing in numbers
        {
          for(j=0; j <affiliate.length;j++)
          {
            if(affiliate[j].adv_id == advertisor[i].adv_id) //check to ensure first come "if" to all advertisors
            {
              generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
            }
          }
       }else{
         generate += "var f = Math.floor(Date.now() / 1000);";
         
         for(j=0,k=0; j <affiliate.length;j++)
         {
           if(affiliate[j].adv_id == advertisor[i].adv_id) //check to ensure first come "if" to all advertisors
           {
              if(k == 0)
              {
                generate += "if (f % "+affiliate[j].divisor+" == 0) {";
              }else if(affiliate[j].divisor > 1){
                generate += "} else if (f % "+affiliate[j].divisor+" == 0) {";
              }else if(affiliate[j].divisor == 1){
                generate += "} else {";
              }
              
              generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
             k++;
           }            
         }
         generate += "}";  
        }
        generate += "}";
      }
      if(country)
      {
        var out={};
        out[country] = generate;
        callback(out);
      }else{
        callback(generate);
      }
      
}


function unicountry(campaign_id,callback)
{
  database = new Database();
  var generate = "var a = Math.round(new Date().getTime() / 1000);";
  database.query("select * from advertisor where active=1 and campaign_id="+campaign_id).then( rows => {
    advertisor = rows;
    var ids= "";
    for(i=0; i <advertisor.length;i++)
    {
     ids += advertisor[i].adv_id+",";
    }
    
    if(ids != "")
    {
      ids = ids.slice(0, -1);
      // console.log("78-"+ids);
      return database.query( "select * from affiliate where adv_id in ("+ids+")" );
    }
  }).then( rows => {
    affiliate = rows;
    return database.close();
  }, err => {
    return database.close().then( () => { throw err; } )
} )
  .then( () => {
    // console.log("advertisor-"+JSON.stringify(advertisor));
    // console.log("affiliate-"+JSON.stringify(affiliate));
      generate += 'var e = "";';
      for(i=0; i <advertisor.length;i++)
      {
        generate += "var "+advertisor[i].adv_name.toLowerCase()+"_time =(parseInt(a) + ("+advertisor[i].enabled_time+" * 60 * 60));";
        cookie_custom_name = advertisor[i].adv_name.toLowerCase().replace("a","").replace("e","").replace("o","");

        generate += "if (typeof(localStorage['"+cookie_custom_name+"']) == 'undefined' || localStorage['"+cookie_custom_name+"'] <= a) {";
        generate += " localStorage['"+cookie_custom_name+"'] = "+advertisor[i].adv_name.toLowerCase()+"_time;";
        if(advertisor[i].is_divisor_needed == 0)  //Not dividing in numbers
        {
          generate += "e += \"<iframe src='"+affiliate[0].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
        
       }else{
         generate += "var f = Math.floor(Date.now() / 1000);";
         
         for(j=0,k=0; j <affiliate.length;j++)
         {
           if(affiliate[j].adv_id == advertisor[i].adv_id)
           {
              if(k == 0)
              {
                generate += "if (f % "+affiliate[j].divisor+" == 0) {";
              }else if(affiliate[j].divisor > 1){
                generate += "} else if (f % "+affiliate[j].divisor+" == 0) {";
              }else if(affiliate[j].divisor == 1){
                generate += "} else {";
              }
              
              generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
             k++;
           }            
         }
         generate += "}";  
        }
        generate += "}";
      }

      callback(generate);
  } ).catch( err => {
    // handle the error
    console.log(err);
  } );  
}

