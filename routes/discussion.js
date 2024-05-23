const express = require("express");
const router = express.Router();
const discussionController = require("../controllers/discussionController");

// Route for creating a new discussion
router.post("/create", discussionController.discussion_post);

// Route for fetching discussions
router.get("/all", discussionController.get_discussions);

// Route for fetching a discussion by ID
router.get("/:discussionId", discussionController.get_discussion_by_id);

// Change discussion banner image
router.put("/change-banner", discussionController.uploadDiscussionBanner);

// Route for fetching discussions by user
router.get("/user", discussionController.get_discussions_by_user);

// Route for fetching discussions by name
router.get("/by-name", discussionController.get_discussions_by_name);

// Route for joining or leaving a discussion
router.put("/join_leave/:discussionId", discussionController.join_leave_disc);

module.exports = router;
