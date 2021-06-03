var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
  name: String,
});

AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

module.exports = mongoose.model("Author", AuthorSchema);
