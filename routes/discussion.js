const express = require("express");
const router = express.Router();
const discussionController = require("../controllers/discussionController");

// Route for creating a new discussion
router.post("/create", discussionController.discussion_post);

// Route for fetching discussions by user
router.get("/user", discussionController.get_discussions_by_user);

// Route for fetching discussions by name
router.get("/by-name", discussionController.get_discussions_by_name);

module.exports = router;
