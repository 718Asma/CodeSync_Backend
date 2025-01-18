const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reported: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "reportedType",
  },
  reportedType: {
    type: String,
    required: true,
    enum: ["User", "post"],
  },
  desc: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;