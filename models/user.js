const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: { type: String, required: true, maxLength: 100, minLength: 3 },
    username: { type: String, maxLength: 100, unique: true, minLength: 3 },
    password: { type: String, maxLength: 100, minLength: 8 },
    googleId: { type: String },
});

// Virtual for user's URL
userSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/user/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", userSchema);
