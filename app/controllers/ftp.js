var Client = require('ftp');
var fs = require('fs');
const directory = 'output';
const path = require('path');
const pool = require('../lib/mysql_conn.js');

exports.ftp_upload_file = function(req,res){
    // console.log(req.params.campaign_id);
    pool.query("select * from campaign where id="+req.params.campaign_id,function(err,rows){
        if(!err) {
            files_in_output(directory,function(files){
                files = JSON.parse(files);
                // console.log("files-"+files);
                // console.log("flength-"+files.length);
                var c = new Client();
                var file_count=1;
                files.forEach(function(file){               
                    c.on('ready', function() {
                        upload_file_name = file.split("/");
                        upload_file_name = upload_file_name[(upload_file_name.length -1 )];
                        // console.log("upload_file_name-"+upload_file_name);  
                        // console.log("file_count-"+file_count);                        
                        try{
                            c.put(file, rows[0].directory+'/'+upload_file_name, function(err) {
                                if (err) throw err;
                                purge_url = rows[0].live_url+"/test_api/"+upload_file_name;
                                purgeFiles(purge_url,rows[0].zone_id,function(r){
                                    if(r == 2)
                                    {
                                        req.flash('error', 'Uploaded but Failed to Purge.');
                                        res.redirect('/campaign');
                                    }
                                    else if(r == 1 && file_count == files.length){
                                        req.flash('success', 'Uploaded & Purged Successfully');
                                        res.redirect('/campaign');
                                    }
                                    file_count++;
                                });
                                c.end();
                            });
                        }catch(error){
                            console.log(error.code);
                            req.flash('error', 'Failed to upload. Error-'+error.code);
                            res.redirect('/campaign');  
                        }
                    });
                     
                });
                c.connect({
                    host : rows[0].host,
                    user : rows[0].username,
                    password : rows[0].password
                });
                
            });
        }
    });
    
}


function purgeFiles(url,zone_id,callback)
{
    var cf = require('cloudflare')({
        email: process.env.CF_EMAIL,
        key: process.env.CF_KEY
    });
    cf.zones.purgeCache(zone_id, { "files": [url] }).then(function (resp) {
        // console.log(resp);
        if(resp.success){
            callback(1);
        }else{
            callback(2);
        }
    });
    // cf.zones.read("bbeffbbf5f479a90b0c3a545eea1eaee").then(function (resp) {
    //     console.log(resp.result.status);
    //   });
}
function files_in_output(directory,callback)
{
    var filename = [];
    // return new Promise(function (fulfill, reject){
      fs.readdir(directory, (err, files) => {
        if (!err){
            filecount=1;
            for (const file of files) {
                if(file != ".DS_Store")
                {
                    var stats = fs.statSync(path.join(directory, file));
                    if(stats.isFile())
                    {
                        filename.push(directory+"/"+file);
                    }
                    if(filecount == files.length)
                    {
                        callback(JSON.stringify(filename));
                    }
                }
                filecount++;
            }
        }
    });        
    // });
}