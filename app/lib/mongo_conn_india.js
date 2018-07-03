const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.IND_MongoDB);

module.exports = exports = mongoose;
