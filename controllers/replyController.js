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

// Like a reply
exports.like_reply = [
  passport.authenticate("jwt", { session: false }),
  param("replyId").notEmpty().withMessage("Reply ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const replyId = req.params.replyId;
      // Increment the upvotes counter by 1
      const reply = await Reply.findByIdAndUpdate(replyId, { $inc: { upvotes: 1 } }, { new: true });
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      res.status(200).json(reply);
    } catch (error) {
      console.error("Error liking reply:", error);
      next(error);
    }
  }),
];

// Un-like a reply
exports.unlike_reply = [
  passport.authenticate("jwt", { session: false }),
  param("replyId").notEmpty().withMessage("Reply ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const replyId = req.params.replyId;
      // Decrement the upvotes counter by 1
      const reply = await Reply.findByIdAndUpdate(replyId, { $inc: { upvotes: -1 } }, { new: true });
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      res.status(200).json(reply);
    } catch (error) {
      console.error("Error un-liking reply:", error);
      next(error);
    }
  }),
];

// Dislike a reply
exports.dislike_reply = [
  passport.authenticate("jwt", { session: false }),
  param("replyId").notEmpty().withMessage("Reply ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const replyId = req.params.replyId;
      // Increment the downvotes counter by 1
      const reply = await Reply.findByIdAndUpdate(replyId, { $inc: { downvotes: 1 } }, { new: true });
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      res.status(200).json(reply);
    } catch (error) {
      console.error("Error disliking reply:", error);
      next(error);
    }
  }),
];

// Un-dislike a reply
exports.undislike_reply = [
  passport.authenticate("jwt", { session: false }),
  param("replyId").notEmpty().withMessage("Reply ID is required"),
  asyncHandler(async (req, res, next) => {
    try {
      const replyId = req.params.replyId;
      // Decrement the downvotes counter by 1
      const reply = await Reply.findByIdAndUpdate(replyId, { $inc: { downvotes: -1 } }, { new: true });
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      res.status(200).json(reply);
    } catch (error) {
      console.error("Error un-disliking reply:", error);
      next(error);
    }
  }),
];

// Delete a reply
exports.delete_reply = [
  // Authenticate user with JWT
  passport.authenticate("jwt", { session: false }),

  // Validate the "replyId" parameter
  param("replyId").notEmpty().withMessage("Reply ID is required"),

  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors if any
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Extract the reply ID from the request parameters
      const replyId = req.params.replyId;

      // Attempt to find the reply by its ID
      const reply = await Reply.findById(replyId);

      // If the reply doesn't exist, return a 404 status with a message
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      // Check if the authenticated user is the creator of the reply
      if (req.user._id.toString() !== reply.owner.toString()) {
        // If the user is not the creator of the reply, return a 403 status with a message
        return res.status(403).json({ message: "Unauthorized to delete this reply" });
      }

      // Delete the reply
      const deletedReply = await Reply.findByIdAndDelete(replyId);

      // Return a success message and the deleted reply data
      res.status(200).json({ message: "Reply deleted successfully", reply: deletedReply });
    } catch (error) {
      // Log the error and pass it to the error handler
      console.error("Error deleting reply:", error);
      next(error);
    }
  }),
];
