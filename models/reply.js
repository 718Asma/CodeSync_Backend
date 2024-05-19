const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const replySchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    content: { type: String, required: true },
    upvotes: [{
        type: Schema.Types.ObjectId, ref: "User"
    }],
    downvotes: [{
        type: Schema.Types.ObjectId, ref: "User"
    }],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Reply = mongoose.model("reply", replySchema);

module.exports = Reply;
