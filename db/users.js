var records = [
    { id: 1, username: 'nitish', password: 'niti@india', displayName: 'Nitish', emails: [ { value: 'niti@example.com' } ] }
  , { id: 2, username: 'satheesh', password: 'satheesh@delhi', displayName: 'Satheesh', emails: [ { value: 'satheesh@example.com' } ] }
  , { id: 3, username: 'sania', password: 'sania@1234', displayName: 'Sania', emails: [ { value: 'sania@example.com' } ] }
  , { id: 4, username: 'sumeet', password: 'AsiX&w7s$', displayName: 'sumeet', emails: [ { value: 'sumeet@example.com' } ] }
  , { id: 5, username: 'messi', password: 'messi@1234', displayName: 'sumeet', emails: [ { value: 'sumeet@example.com' } ] }
  , { id: 6, username: 'tuhi', password: 'tuhi@pune', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 7, username: 'deepika', password: 'deepika@thane', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 8, username: 'karthick', password: 'karthick@goa', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 9, username: 'jalpa', password: 'jalpa@kerela', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 10, username: 'partha', password: 'partha@madras', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 11, username: 'rajendra', password: 'rajendra@mumbai', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 12, username: 'harish', password: 'harish@banglore', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
  , { id: 13, username: 'shailesh', password: 'shailesh@nagpur', displayName: 'tuhi', emails: [ { value: 'tuhi@example.com' } ] }
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
