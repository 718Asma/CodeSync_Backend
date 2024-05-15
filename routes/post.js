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

module.exports = router;
