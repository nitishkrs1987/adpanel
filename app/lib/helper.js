const fs = require('fs');
const path = require('path');
const directory = 'output';
class helper{
   
    deleteFiles(){
        // console.log(directory);
        return new Promise(function (fulfill, reject){
          fs.readdir(directory, (err, files) => {
            if (err) reject(err);
            var filecount=1;
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


      
}
module.exports = helper;