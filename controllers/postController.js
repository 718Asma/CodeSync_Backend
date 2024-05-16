// postController.js

const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const Post = require("../models/post");
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

// Like a post
exports.like_post = [
  passport.authenticate("jwt", { session: false }),
  param("postId").notEmpty().withMessage("Post ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const postId = req.params.postId;
      // Increment the likes counter by 1
      const post = await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error("Error liking post:", error);
      next(error);
    }
  }),
];

// Un-like a post
exports.unlike_post = [
  passport.authenticate("jwt", { session: false }),
  param("postId").notEmpty().withMessage("Post ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const postId = req.params.postId;
      // Decrement the likes counter by 1
      const post = await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } }, { new: true });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error("Error un-liking post:", error);
      next(error);
    }
  }),
];

// Dislike a post
exports.dislike_post = [
  passport.authenticate("jwt", { session: false }),
  param("postId").notEmpty().withMessage("Post ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const postId = req.params.postId;
      // Increment the dislikes counter by 1
      const post = await Post.findByIdAndUpdate(postId, { $inc: { dislikes: 1 } }, { new: true });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error("Error disliking post:", error);
      next(error);
    }
  }),
];

// Un-dislike a post
exports.undislike_post = [
  passport.authenticate("jwt", { session: false }),
  param("postId").notEmpty().withMessage("Post ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const postId = req.params.postId;
      // Decrement the dislikes counter by 1
      const post = await Post.findByIdAndUpdate(postId, { $inc: { dislikes: -1 } }, { new: true });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error("Error un-disliking post:", error);
      next(error);
    }
  }),
];

// Delete a post
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
        return res.status(403).json({ message: "Unauthorized to delete this post" });
      }

      // Delete the post
      const deletedPost = await Post.findByIdAndDelete(postId);

      // Return a success message and the deleted post data
      res.status(200).json({ message: "Post deleted successfully", post: deletedPost });
    } catch (error) {
      // Log the error and pass it to the error handler
      console.error("Error deleting post:", error);
      next(error);
    }
  }),
];
