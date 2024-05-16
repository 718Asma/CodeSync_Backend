const express = require("express");
const router = express.Router();
const replyController = require("../controllers/replyController");

// Route to create a new reply
// POST /create/:postId
// Requires JWT authentication
// Expects post ID in URL parameter and content in request body
// Validates content length
router.post("/create/:postId", replyController.create_reply);

// Route to get replies by user
// GET /user
// Requires JWT authentication
// Retrieves replies created by the authenticated user
router.get("/user", replyController.get_replies_by_user);

// Route to get replies by post
// GET /by-post/:postId
// Requires JWT authentication
// Expects post ID in URL parameter
// Retrieves replies for the specified post
router.get("/by-post/:postId", replyController.get_replies_by_post);

// Route to like a reply
// PUT /like/:replyId
// Requires JWT authentication
// Expects reply ID in URL parameter
// Increments the like count of the specified reply
router.put("/like/:replyId", replyController.like_reply);

// Route to un-like a reply
// PUT /unlike/:replyId
// Requires JWT authentication
// Expects reply ID in URL parameter
// Decrements the like count of the specified reply
router.put("/unlike/:replyId", replyController.unlike_reply);

// Route to dislike a reply
// PUT /dislike/:replyId
// Requires JWT authentication
// Expects reply ID in URL parameter
// Increments the dislike count of the specified reply
router.put("/dislike/:replyId", replyController.dislike_reply);

// Route to un-dislike a reply
// PUT /undislike/:replyId
// Requires JWT authentication
// Expects reply ID in URL parameter
// Decrements the dislike count of the specified reply
router.put("/undislike/:replyId", replyController.undislike_reply);

// Route to delete a reply
// DELETE /:replyId
// Requires JWT authentication
// Expects reply ID in URL parameter
// Deletes the specified reply if the authenticated user is the owner
router.delete("/:replyId", replyController.delete_reply);

module.exports = router;
