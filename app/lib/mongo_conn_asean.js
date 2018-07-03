const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.ASEAN_MongoDB);

module.exports = exports = mongoose;
