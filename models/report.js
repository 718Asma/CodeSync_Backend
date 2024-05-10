const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reported: { type: Schema.Types.ObjectId, ref: "User", required: true },
  desc: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("report", reportSchema);

module.exports = Report;
