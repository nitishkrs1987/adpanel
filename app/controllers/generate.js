const fs = require('fs');
const path = require('path');
const directory = 'output';
const Database = require('../lib/conn.js');
const helpers = require('../lib/helper.js');
const generate_helpers = require('../lib/generate_helper.js');


exports.index = function (req,res) {
  // console.log(req.params.campaign_id);
  database = new Database();
  helper = new helpers();
  
  database.query( 'select * from campaign where id='+req.params.campaign_id ).then( rows => {
    if(rows[0].is_country_divided == 0)
    {
      var filename = directory+"/promo_img.js";
      if(rows[0].type == 2)
      {
        filename = directory+"/cook.js";
      }
      helper.deleteFiles().then(function (dd){ 
        unicountry(rows[0].id,rows[0].type,function(resp){
          fs.writeFile(filename, resp, function(err) {
            if (err) {reject(err);}
            // else{
            //   req.flash('success', 'File(s) generated successfully Successfully.');
            //   res.redirect('/campaign')
            // }
            else{res.download(filename);}
          });   
        }); 
      }); 
    }else{     
      var filename = directory+"/promo_img_"; 
      if(rows[0].type == 2)
      {
        filename = directory+"/cook_";
      }
        var promises = [];
        database.query("select country from advertisor where active=1 and campaign_id="+rows[0].id+" group by country").then( rows_country => {
          country = rows_country;
        }).then( () => {
          // console.log(country);
          helper.deleteFiles().then(function (dd){  
            for(i=0; i <country.length;i++)
            {
              // console.log(country[i].country.toLowerCase());
              // var result = Promise.all();
              promises[i] = new Promise(function (fulfill, reject){
                multicountry(rows[0].id,rows[0].type,country[i].country.toLowerCase()).then(function(resp){
                  // console.log(resp);
                  var country1 = "";
                  for (var cc in resp) {
                    country1 = cc;
                  }
                  // console.log(country1);
                  fname = filename+country1+".js";
                  fs.writeFile(fname, resp[country1], function(err) {
                    if (err) reject(err);
                    else fulfill(1);
                  });                  

                }).catch((error) => { console.log(error); }); //End of multi-country call
              }); 

            } //End of for loop
          }); //End of deleteFiles call
        }); //End of database query

        Promise.all(promises).then(function(values) {
          // console.log("142");
          req.flash('success', 'File(s) generated successfully Successfully.');
          res.redirect('/campaign');
        });      
    }
  });
}

function multicountry(campaign_id,camp_type,country,callback)
{
  
  return new Promise(function (fulfill, reject){
    database = new Database();
    gen_helper = new generate_helpers();
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
      // gen_helper.generate_js(advertisor[country],affiliate[country],country,function(resp){
      //   fulfill(resp);
      // });
      if(camp_type ==1 )
    {
      gen_helper.generate_js(advertisor[country],affiliate[country],country,function(resp){
        fulfill(resp);
       });
    }else{
      gen_helper.generate_self_js(advertisor[country],affiliate[country],country,function(resp){
        fulfill(resp);
       });
      }
    } ).catch( err => {
      reject(err);
      // console.log(err);
    } );  

});
}


function unicountry(campaign_id,camp_type,callback)
{
  database = new Database();
  gen_helper = new generate_helpers();
  var generate = "var a = Math.round(new Date().getTime() / 1000);";
  database.query("select A.*,B.live_url from advertisor A,campaign B where A.campaign_id=B.id and A.active=1 and A.campaign_id="+campaign_id).then( rows => {
    advertisor = rows;
    var ids= "";
    var multi_prod_ids= "";
    for(i=0; i <advertisor.length;i++)
    {
      ids += advertisor[i].adv_id+",";
    }
    if(ids != "")
    {
      ids = ids.slice(0, -1);
      return database.query( "select * from affiliate where adv_id in ("+ids+") order by divisor desc" );
    }
    
  }).then( rows => {
    affiliate = rows;
    return database.close();
  }, err => {
    return database.close().then( () => { throw err; } )
} )
  .then( () => {
    // console.log(affiliate);
    if(camp_type ==1 )
    {
      gen_helper.generate_js(advertisor,affiliate,false,function(resp){
        callback(resp);
       });
    }else{
      gen_helper.generate_self_js(advertisor,affiliate,false,function(resp){
        callback(resp);
       });
    }
   
  } ).catch( err => {
    // handle the error
    console.log(err);
  } );  
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