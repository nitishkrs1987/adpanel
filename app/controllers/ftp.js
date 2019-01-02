var Client = require('ftp');
// var PromiseFtp = require('promise-ftp');
var promisify = require('promisify-node'),
    PromiseFtp = require('promise-ftp'),
    fs = promisify('fs');
// var fs = require('fs');
const directory = 'output';
const path = require('path');
const moment = require('moment');
const pool = require('../lib/mysql_conn.js');

var _ftp = new PromiseFtp();

exports.ftp_upload_file = function(req,res){
    pool.query("select * from campaign where id="+req.params.campaign_id,function(err,rows){
     if(!err) {     
            
        publish(directory).done(function(files){
            // console.log(files);
            if(_ftp.getConnectionStatus() == "connected" || _ftp.getConnectionStatus() == "connecting")
            {
                _ftp.end();
            }
            _ftp.connect({host: rows[0].host, user: rows[0].username, password: rows[0].password})
            .then(() => multiRenameFiles(files,rows[0].directory))
            .then(() => multiPutFiles(files,rows[0].directory))
            .then(() => purgeFile(rows[0].live_url,files,rows[0].zone_id))
            .then(function () {
                // console.log('disconnecting...')
                _ftp.end();     
                req.flash('success', 'Uploaded & Purged Successfully');
                res.redirect('/campaign');           
            }).catch((err)=>{
                req.flash('error', 'Uploaded but Failed to Purge. Due to '+err);
                res.redirect('/campaign');
            });
        
           
        });
        
     }
    });

};
function purgeFile(live_url,fileList,zone_id)
{
    return new Promise(function(resolve, reject){
        var cf = require('cloudflare')({
            email: process.env.CF_EMAIL,
            key: process.env.CF_KEY
        });


        var purge_urls = [];
        fileList.forEach(function(file){        
            // console.log('Purging:', live_url +"/api/"+ file);
            if(process.env.NODE_ENV == "development")
                purge_urls.push(live_url+"/test_api/"+file);
            else
                purge_urls.push(live_url+"/api/"+file);
        });
            
        // console.log(purge_urls);
        cf.zones.purgeCache(zone_id, { "files": purge_urls }).then(function(resp){
            // console.log(resp);
            if(resp.success){
                resolve();
            }else{
                // throw new Error("Purge Error");
                reject(resp);
            }
        }).catch((err) => {
            console.log(err.toString());
            reject();
          });
    });
}
function multiPutFiles(fileList,_remoteFilePath){
    return new Promise(function(resolve, reject){
      var chain = Promise.resolve();
  
      fileList.forEach(function(file, i, arr){
        chain = chain.then(() => {
        //   console.log('uploading:', directory +"/"+ file);
          return _ftp.put(directory +"/"+ file, _remoteFilePath +"/"+ file);
        })
        // file upload errors
        .catch((err) => { console.log(err.toString()); _ftp.end(); })
  
        if(i === arr.length - 1)
          chain.then(() => resolve())
      })
    })
  }
function multiRenameFiles(fileList,_remoteFilePath){
    return new Promise(function(resolve, reject){
      var chain = Promise.resolve();
  
      fileList.forEach(function(file, i, arr){
        chain = chain.then(() => {
        //   console.log('Renaming:', _remoteFilePath +"/"+ file);
          return _ftp.rename(_remoteFilePath +"/"+ file, _remoteFilePath +"/back/"+ new moment().format('YYYY_MM_DD_HH_mm')+"_" + file);
        })
        // file upload errors
        .catch((err) => { console.log(err.toString()); _ftp.end(); })
  
        if(i === arr.length - 1)
          chain.then(() => resolve())
      })
    })
  }

publish = function(directory){
    return fs.readdir(directory)
      .then(function(files){
        var pattern = new RegExp('.js')
        return files.filter((file) => pattern.test(file))
      })
  }