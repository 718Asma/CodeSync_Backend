const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Route to create a new post
router.post("/create", postController.create_post);

// Route to get all posts
router.get("/all", postController.get_posts);

// Route to get a post by ID
router.get("/id/:postId", postController.get_post_by_id);

// Route to get posts by creator
router.get("/user/:userId", postController.get_post_by_creator);

// Route to get posts for user home page
router.get("/fyp", postController.get_posts_from_participated_discussions);

// Route to get posts by discussion
router.get("/by-discussion/:discussionId", postController.get_post_by_discussion);

// Route to get the number of likes for a post
router.get("/likes/:postId", postController.get_number_of_likes);

// Route to get the number of dislikes for a post
router.get("/dislikes/:postId", postController.get_number_of_dislikes);

// Router to add images to post by post ID
router.put("/upload-images/", postController.uploadPostImages);

// Route to like a post
router.put("/like/:postId", postController.like_post);

// Route to dislike a post
router.put("/dislike/:postId", postController.dislike_post);

// Route to delete a post
router.delete("/delete/:postId", postController.delete_post);

module.exports = router;