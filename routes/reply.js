const express = require("express");
const router = express.Router();
const replyController = require("../controllers/replyController");

// Route to create a new reply
router.post("/create", replyController.create_reply);

// Route to get replies by user
router.get("/user", replyController.get_replies_by_user);

// Route to get replies by post
router.get("/by-post/:postId", replyController.get_replies_by_post);

module.exports = router;
