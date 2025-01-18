const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const passport = require("passport");

const Notification = require("../models/notification");

// Get all notifications for the logged-in user
exports.notifications_get = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const notifications = await Notification.find({
            recipient: req.user._id,
            triggeredBy: { $ne: req.user._id },
        })
            .sort({ isRead: 1, createdAt: -1 })
            .populate("referenceObject")
            .populate("triggeredBy");
        res.json(notifications);
    }),
];

// Mark a notification as read by notification ID
exports.mark_read_post = [
    passport.authenticate("jwt", { session: false }),
    param("notificationId")
        .notEmpty()
        .withMessage("Notification ID is required"),
    asyncHandler(async (req, res) => {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(notification);
    }),
];

// Mark all notifications as read
exports.mark_all_read_post = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const notifications = await Notification.updateMany(
            { recipient: req.user._id },
            { isRead: true }
        );
        res.json({ message: "All notifications marked as read" });
    }),
];

// Create a new notification
exports.create_notification_post = [
    passport.authenticate("jwt", { session: false }),
    body("recipient").notEmpty().withMessage("Recipient is required"),
    body("notificationType")
        .notEmpty()
        .withMessage("Notification type is required"),
    body("referenceObject")
        .notEmpty()
        .withMessage("Reference object is required"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const triggeredBy = [
            "post_tag",
            "post_like",
            "comment",
            "message",
            "friend_request_sent",
            "friend_request_accepted",
            "friend_request_rejected",
        ].includes(req.body.notificationType)
            ? req.user._id
            : undefined;

        const notification = new Notification({
            recipient: req.body.recipient,
            notificationType: req.body.notificationType,
            referenceObject: req.body.referenceObject,
            triggeredBy: triggeredBy,
        });
        await notification.save();
        res.status(201).json(notification);
    }),
];

// Delete a notification by notification ID
exports.delete_notification_delete = [
    passport.authenticate("jwt", { session: false }),
    param("notificationId")
        .notEmpty()
        .withMessage("Notification ID is required"),
    asyncHandler(async (req, res) => {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.notificationId,
            recipient: req.user._id,
        });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json({ message: "Notification deleted successfully" });
    }),
];

// Delete all notifications for the logged-in user
exports.delete_all_notifications_delete = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const result = await Notification.deleteMany({
            recipient: req.user._id,
        });
        if (result.deletedCount === 0) {
            return res
                .status(404)
                .json({ message: "No notifications found to delete" });
        }
        res.status(200).json({
            message: "All notifications deleted successfully",
        });
    }),
];
