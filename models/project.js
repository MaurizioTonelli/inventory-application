var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "Author" },
  title: { type: String, minLength: 1 },
  technologies: [{ type: Schema.Types.ObjectId, ref: "Technology" }],
});

ProjectSchema.virtual("url").get(function () {
  return "/catalog/project/" + this._id;
});

module.exports = mongoose.model("Project", ProjectSchema);
