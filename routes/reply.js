const express = require("express");
const router = express.Router();
const replyController = require("../controllers/replyController");

// Route to create a new reply
router.post("/create/:postId", replyController.create_reply);

// Route to get replies by user
router.get("/user", replyController.get_replies_by_user);

// Route to get replies by post
router.get("/by-post/:postId", replyController.get_replies_by_post);

// Route to get the number of upvotes for a reply
router.get("/upvotes/:replyId", replyController.get_number_of_upvotes);

// Route to get the number of downvotes for a reply
router.get("/downvotes/:replyId", replyController.get_number_of_downvotes);

// Route to upvote a reply
router.put("/upvote/:replyId", replyController.upvote_reply);

// Route to downvote a reply
router.put("/downvote/:replyId", replyController.downvote_reply);

// Route to delete a reply
router.delete("/delete/:replyId", replyController.delete_reply);

module.exports = router;
