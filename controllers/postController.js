// postController.js

const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const Post = require("../models/post");
const Reply = require("../models/reply");
const passport = require("passport");
const { uploadPostImages } = require("../multer");

require("../strategies/local");
require("../strategies/jwt");

exports.create_post = [
  // Authenticate user and validate input data
  passport.authenticate("jwt", { session: false }),
  uploadPostImages, // Handle multiple image uploads, up to 5 images
  body("discussionId").notEmpty().withMessage("Discussion ID is required"),
  body("content")
    .notEmpty()
    .isLength({ min: 5, max: 500 })
    .withMessage("Content must be between 5 and 500 characters"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { discussionId, content } = req.body;
      const owner = req.user._id; // Extract owner ID from JWT payload

      let images = [];
      if (req.files) {
        // If files were uploaded, store their paths
        images = req.files.map((file) => file.path);
      }

      // Create a new post
      const post = new Post({
        owner,
        discussionId,
        content,
        images,
      });

      // Save the post to the database
      await post.save();

      res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
      console.error("Error creating post:", error);
      next(error);
    }
  }),
];

exports.get_post_by_creator = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    try {
      const owner = req.user._id; // Extract owner ID from JWT payload

      // Find posts where the specified user is the owner
      const posts = await Post.find({ owner });

      if (posts.length === 0) {
        return res.status(200).json({ message: "User has no posts" });
      }

      res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching posts by creator:", error);
      next(error);
    }
  }),
];

exports.get_post_by_discussion = [
  passport.authenticate("jwt", { session: false }),
  param("discussionId").notEmpty().withMessage("Discussion Id Required"),
  asyncHandler(async (req, res, next) => {
    try {
      const discussionId = req.params.discussionId; // Retrieve discussion ID from URL params

      // Find posts belonging to the specified discussion
      const posts = await Post.find({ discussionId: discussionId });

      if (posts.length === 0) {
        return res
          .status(200)
          .json({ message: "No posts found for this discussion" });
      }

      res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching posts by discussion:", error);
      next(error);
    }
  }),
];

// Get the number of likes for a post
exports.get_number_of_likes = async (req, res, next) => {
  try {
    const postId = req.params.postId; // Extract post ID from URL params
    const post = await Post.findById(postId); // Find post by ID
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const numberOfLikes = post.likes ? post.likes.length : 0;
    res.status(200).json({ numberOfLikes });
  } catch (error) {
    console.error("Error getting number of likes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get the number of dislikes for a post
exports.get_number_of_dislikes = async (req, res, next) => {
  try {
    const postId = req.params.postId; // Extract post ID from URL params
    const post = await Post.findById(postId); // Find post by ID
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const numberOfDislikes = post.dislikes ? post.dislikes.length : 0;
    res.status(200).json({ numberOfDislikes });
  } catch (error) {
    console.error("Error getting number of dislikes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.like_post = [
  // Authenticate user with JWT
  passport.authenticate("jwt", { session: false }),

  // Validate the "postId" parameter
  param("postId").notEmpty().withMessage("Post ID is required"),

  asyncHandler(async (req, res, next) => {
    try {
      // Extract postId and userId from the request
      const postId = req.params.postId;
      const userId = req.user._id;

      // Find the post by its ID
      const post = await Post.findById(postId);

      // Check if the post exists
      if (!post) {
        // If post doesn't exist, return a 404 response
        return res.status(404).json({ message: "Post not found" });
      }

      // Initialize post.likes array if it's undefined
      if (!post.likes) {
        post.likes = [];
      }

      // Check if the user has already liked the post
      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex > -1) {
        // If user has already liked the post, remove the like
        post.likes.splice(likeIndex, 1);
      } else {
        // If user hasn't liked the post, check if they have disliked it
        const dislikeIndex = post.dislikes ? post.dislikes.indexOf(userId) : -1;
        if (dislikeIndex > -1) {
          // If user has disliked the post, remove the dislike
          post.dislikes.splice(dislikeIndex, 1);
        }
        // Add user's like to the post
        post.likes.push(userId);
      }

      // Save the updated post
      await post.save();

      // Send success response with the updated post
      res.status(200).json({
        message: "Like status updated successfully",
        post,
      });
    } catch (error) {
      // Log and handle errors
      console.error("Error updating like status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),
];

exports.dislike_post = [
  // Authenticate user with JWT
  passport.authenticate("jwt", { session: false }),

  // Validate the "postId" parameter
  param("postId").notEmpty().withMessage("Post ID is required"),

  asyncHandler(async (req, res, next) => {
    try {
      // Extract postId and userId from the request
      const postId = req.params.postId;
      const userId = req.user._id;

      // Find the post by its ID
      const post = await Post.findById(postId);

      // Check if the post exists
      if (!post) {
        // If post doesn't exist, return a 404 response
        return res.status(404).json({ message: "Post not found" });
      }

      // Initialize post.dislikes array if it's undefined
      if (!post.dislikes) {
        post.dislikes = [];
      }

      // Check if the user has already disliked the post
      const dislikeIndex = post.dislikes.indexOf(userId);
      if (dislikeIndex > -1) {
        // If user has already disliked the post, remove the dislike
        post.dislikes.splice(dislikeIndex, 1);
      } else {
        // If user hasn't disliked the post, check if they have liked it
        const likeIndex = post.likes ? post.likes.indexOf(userId) : -1;
        if (likeIndex > -1) {
          // If user has liked the post, remove the like
          post.likes.splice(likeIndex, 1);
        }
        // Add user's dislike to the post
        post.dislikes.push(userId);
      }

      // Save the updated post
      await post.save();

      // Send success response with the updated post
      res.status(200).json({
        message: "Dislike status updated successfully",
        post,
      });
    } catch (error) {
      // Log and handle errors
      console.error("Error updating dislike status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),
];


// Delete a post and its associated replies
exports.delete_post = [
  // Authenticate user with JWT
  passport.authenticate("jwt", { session: false }),

  // Validate the "postId" parameter
  param("postId").notEmpty().withMessage("Post ID is required"),

  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors if any
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Extract the post ID from the request parameters
      const postId = req.params.postId;

      // Attempt to find the post by its ID
      const post = await Post.findById(postId);

      // If the post doesn't exist, return a 404 status with a message
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the authenticated user is the owner of the post
      if (req.user._id.toString() !== post.owner.toString()) {
        // If the user is not the owner of the post, return a 403 status with a message
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this post" });
      }

      // Delete all replies associated with the post
      const replies = await Reply.deleteMany({ post: postId });
      console.log(`${replies.deletedCount} replies deleted`);

      // Delete the post
      const deletedPost = await Post.findByIdAndDelete(postId);

      // Return a success message and the deleted post data
      res.status(200).json({
        message: "Post and associated replies deleted successfully",
        post: deletedPost,
      });
    } catch (error) {
      // Log the error and pass it to the error handler
      console.error("Error deleting post and associated replies:", error);
      next(error);
    }
  }),
];
