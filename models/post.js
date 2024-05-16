const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    discussionId: {
        type: Schema.Types.ObjectId,
        ref: "Discussion",
        required: true,
    },
    content: { type: String, required: true },
    likes: { type: Number, default: 0, min: 0 },
    dislikes: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.model("post", postSchema);

module.exports = Post;
