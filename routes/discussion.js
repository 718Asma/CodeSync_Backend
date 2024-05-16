const express = require("express");
const router = express.Router();
const discussionController = require("../controllers/discussionController");

// Route for creating a new discussion
// POST /create
// Requires JWT authentication
// Expects title and description in request body, and an optional banner image
// Validates title and description length
router.post("/create", discussionController.discussion_post);

// Route for fetching discussions by user
// GET /user
// Requires JWT authentication
// Retrieves discussions created by the authenticated user
router.get("/user", discussionController.get_discussions_by_user);

// Route for fetching discussions by name
// GET /by-name
// Requires JWT authentication
// Expects a 'name' query parameter to search discussions by title
// Validates 'name' length
router.get("/by-name", discussionController.get_discussions_by_name);

module.exports = router;
