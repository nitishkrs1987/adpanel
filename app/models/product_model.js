var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var plinkSchema = new Schema({
  country_code: String,
  product_url: String,
  enabled: Number,
  track_stock: Number,
  vendor: Number,
  last_update: Date
});
module.exports = mongoose.model('comp_vendor', plinkSchema,"comp_vendor");
