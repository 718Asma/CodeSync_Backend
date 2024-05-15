const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Route to create a new post
router.post("/create", postController.create_post);

// Route to get posts by creator
router.get("/user", postController.get_post_by_creator);

// Route to get posts by discussion
router.get(
  "/by-discussion/:discussionId",
  postController.get_post_by_discussion
);

// Route to like a post
router.put("/like/:postId", postController.like_post);

// Route to un-like a post
router.put("/unlike/:postId", postController.unlike_post);

// Route to dislike a post
router.put("/dislike/:postId", postController.dislike_post);

// Route to un-dislike a post
router.put("/undislike/:postId", postController.undislike_post);

// Route to delete a post
router.delete("/:postId", postController.delete_post);

module.exports = router;
