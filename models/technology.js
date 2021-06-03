var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TechnologySchema = new Schema({
  name: String,
  description: String,
});

TechnologySchema.virtual("url").get(function () {
  return "/catalog/technology/" + this._id;
});

module.exports = mongoose.model("Technology", TechnologySchema);
