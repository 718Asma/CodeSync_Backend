const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const discussionSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  banner: {
    type: String,
    default: "/assets/images/dfltBanner.jpg",
  },
});

const Discussion = mongoose.model("discussion", discussionSchema);

module.exports = Discussion;
