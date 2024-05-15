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
  body("discussion").notEmpty().withMessage("Discussion ID is required"),
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
      const { discussion, content } = req.body;
      const owner = req.user._id; // Extract owner ID from JWT payload

      let images = [];
      if (req.files) {
        // If files were uploaded, store their paths
        images = req.files.map((file) => file.path);
      }

      // Create a new post
      const post = new Post({
        owner,
        discussion,
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
      const posts = await Post.find({ discussion: discussionId });

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
