const fs = require('fs');
// var multiDownload = require('multi-download');
exports.index = function (req,res) {
  var items = [1, 2, 3, 4, 5];
  var fn = function asyncMultiplyBy2(v){ // sample async action
      return new Promise(resolve => setTimeout(() => resolve(v * 2), 100));
  };
  // map over forEach since it returns

  var actions = items.map(fn); // run the function over all items

  // we now have a promises array and we want to wait for it

  var results = Promise.all(actions); // pass array of promises

  results.then(data => // or just .then(console.log)
      console.log(data) // [2, 4, 6, 8, 10]
  );

  // we can nest this of course, as I said, `then` chains:

  // var res2 = Promise.all([1, 2, 3, 4, 5].map(fn)).then(
  //     data => Promise.all(data.map(fn))
  // ).then(function(data){
  //     // the next `then` is executed after the promise has returned from the previous
  //     // `then` fulfilled, in this case it's an aggregate promise because of
  //     // the `.all`
  //     return Promise.all(data.map(fn));
  // }).then(function(data){
  //     // just for good measure
  //     return Promise.all(data.map(fn));
  // });
  //
  // // now to get the results:
  //
  // res2.then(function(data){
  //     console.log(data); // [16, 32, 48, 64, 80]
  // });
};
exports.save = function (req,res) {
  console.log(typeof(req.body));
  gimli = req.body;
  for (let key in gimli) {
  console.log(key.toUpperCase() + ':', gimli[key]);
}
}
exports.download = function (req,res) {
  var filename = ["output/a11.js","output/a21.js"];
  var fn = function write(filename){
    return new Promise(function (fulfill, reject){
      fs.writeFile(filename, "abc", function(err) {
        if (err) reject(err);
        else fulfill(filename);
      });
    });
  };
  //
  var actions = filename.map(fn); // run the function over all items
  //
  // // we now have a promises array and we want to wait for it
  //
  var results = Promise.all(actions); // pass array of promises
  res.render("exp",{files:filename});
  // res.render("exp");
  // results.then(files =>
  //   // files.forEach(function(f){
  //   //   // console.log(f)
  //   //   res.download(f)
  //   //
  //   // });
  //   // multiDownload(files)
  //   // console.log(fname)
  //     // res.download(fname)
  // ).catch((error) => {
  //  console.log(error);
  // });

};
