const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Route to create a new post
// POST /create
// Requires JWT authentication
// Expects discussion ID and content in request body, and optional images
// Validates discussion ID and content length
router.post("/create", postController.create_post);

// Route to get posts by creator
// GET /user
// Requires JWT authentication
// Retrieves posts created by the authenticated user
router.get("/user", postController.get_post_by_creator);

// Route to get posts by discussion
// GET /by-discussion/:discussionId
// Requires JWT authentication
// Expects discussion ID in URL parameter
// Retrieves posts for the specified discussion
router.get(
  "/by-discussion/:discussionId",
  postController.get_post_by_discussion
);

// Route to like a post
// PUT /like/:postId
// Requires JWT authentication
// Expects post ID in URL parameter
// Increments the like count of the specified post
router.put("/like/:postId", postController.like_post);

// Route to un-like a post
// PUT /unlike/:postId
// Requires JWT authentication
// Expects post ID in URL parameter
// Decrements the like count of the specified post
router.put("/unlike/:postId", postController.unlike_post);

// Route to dislike a post
// PUT /dislike/:postId
// Requires JWT authentication
// Expects post ID in URL parameter
// Increments the dislike count of the specified post
router.put("/dislike/:postId", postController.dislike_post);

// Route to un-dislike a post
// PUT /undislike/:postId
// Requires JWT authentication
// Expects post ID in URL parameter
// Decrements the dislike count of the specified post
router.put("/undislike/:postId", postController.undislike_post);

// Route to delete a post
// DELETE /:postId
// Requires JWT authentication
// Expects post ID in URL parameter
// Deletes the specified post if the authenticated user is the owner
router.delete("/:postId", postController.delete_post);

module.exports = router;
