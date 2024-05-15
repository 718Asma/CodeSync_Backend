const express = require("express");
const router = express.Router();
const replyController = require("../controllers/replyController");

// Route to create a new reply
router.post("/create/:postId", replyController.create_reply);

// Route to get replies by user
router.get("/user", replyController.get_replies_by_user);

// Route to get replies by post
router.get("/by-post/:postId", replyController.get_replies_by_post);

// Route to like a reply
router.put("/like/:replyId", replyController.like_reply);

// Route to un-like a reply
router.put("/unlike/:replyId", replyController.unlike_reply);

// Route to dislike a reply
router.put("/dislike/:replyId", replyController.dislike_reply);

// Route to un-dislike a reply
router.put("/undislike/:replyId", replyController.undislike_reply);

// Route to delete a reply
router.delete("/:replyId", replyController.delete_reply);

module.exports = router;
