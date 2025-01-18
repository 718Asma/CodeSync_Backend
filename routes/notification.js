let express = require("express");
let router = express.Router();
let notificationController = require("../controllers/notificationController");

// Get all notifications for the logged-in user
router.get("/", notificationController.notifications_get);

// Mark a notification as read by notification ID
router.post("/read/id/:notificationId", notificationController.mark_read_post);

// Mark all notifications as read
router.post("/read/all", notificationController.mark_all_read_post);

// Create a new notification
router.post("/create", notificationController.create_notification_post);

// Delete a notification by notification ID
router.delete("/delete/:notificationId", notificationController.delete_notification_delete);

// Delete all notifications for the logged-in user
router.delete("/delete/all", notificationController.delete_all_notifications_delete);

module.exports = router;