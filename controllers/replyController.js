const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const Reply = require("../models/reply");

const passport = require("passport");
require("../strategies/local");
require("../strategies/jwt");

// Controller to create a new reply
exports.create_reply = [
  // Authenticate user and validate input data
  passport.authenticate("jwt", { session: false }),
  body("post").notEmpty().withMessage("Post ID is required"),
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
      const { post, content } = req.body;
      const owner = req.user._id; // Extract owner ID from JWT payload

      // Create a new reply
      const reply = new Reply({
        owner,
        post,
        content,
      });

      // Save the reply to the database
      await reply.save();

      res.status(201).json({ message: "Reply created successfully", reply });
    } catch (error) {
      console.error("Error creating reply:", error);
      next(error);
    }
  }),
];

// Controller to get replies by user
exports.get_replies_by_user = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    try {
      const owner = req.user._id; // Extract owner ID from JWT payload

      // Find replies where the specified user is the owner
      const replies = await Reply.find({ owner });

      if (replies.length === 0) {
        return res.status(200).json({ message: "User has no replies" });
      }

      res.status(200).json({ replies });
    } catch (error) {
      console.error("Error fetching replies by user:", error);
      next(error);
    }
  }),
];

// Controller to get replies by post
exports.get_replies_by_post = [
  passport.authenticate("jwt", { session: false }),
  param("postId").notEmpty().withMessage("Post ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const postId = req.params.postId; // Retrieve post ID from URL params

      // Find replies belonging to the specified post
      const replies = await Reply.find({ post: postId });

      if (replies.length === 0) {
        return res
          .status(200)
          .json({ message: "No replies found for this post" });
      }

      res.status(200).json({ replies });
    } catch (error) {
      console.error("Error fetching replies by post:", error);
      next(error);
    }
  }),
];
