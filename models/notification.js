const mongoose = require("mongoose");

const NotificationType = {
    FRIEND_REQUEST: "friend_request",
    SYSTEM_NOTIFICATION: "system_notification",
    POST_TAG: "post_tag",
    POST_LIKE: "post_like",
    COMMENT: "comment",
    MESSAGE: "message",
    // More notification types will be added as needed
};

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    triggeredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    notificationType: {
        type: String,
        enum: NotificationType,
        required: true,
    },
    referenceObject: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
});

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;