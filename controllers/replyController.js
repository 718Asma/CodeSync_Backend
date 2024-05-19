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
  param("postId").notEmpty().withMessage("Post ID is required"),
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
      const postId = req.params.postId; // Extract post ID from route parameter
      const { content } = req.body;
      const owner = req.user._id; // Extract owner ID from JWT payload

      // Create a new reply
      const reply = new Reply({
        owner,
        post: postId, // Assign post ID to the reply
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

// Get the number of upvotes for a reply
exports.get_number_of_upvotes = async (req, res, next) => {
  try {
    const replyId = req.params.replyId; // Extract reply ID from URL params
    const reply = await Reply.findById(replyId); // Find reply by ID
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }
    const numberOfUpvotes = reply.upvotes ? reply.upvotes.length : 0;
    res.status(200).json({ numberOfUpvotes });
  } catch (error) {
    console.error("Error getting number of upvotes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get the number of downvotes for a reply
exports.get_number_of_downvotes = async (req, res, next) => {
  try {
    const replyId = req.params.replyId; // Extract reply ID from URL params
    const reply = await Reply.findById(replyId); // Find reply by ID
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }
    const numberOfDownvotes = reply.downvotes ? reply.downvotes.length : 0;
    res.status(200).json({ numberOfDownvotes });
  } catch (error) {
    console.error("Error getting number of downvotes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.upvote_reply = [
  // Authenticate user with JWT
  passport.authenticate("jwt", { session: false }),

  // Validate the "replyId" parameter
  param("replyId").notEmpty().withMessage("Reply ID is required"),

  asyncHandler(async (req, res, next) => {
    try {
      // Extract replyId and userId from the request
      const replyId = req.params.replyId;
      const userId = req.user._id;

      // Find the reply by its ID
      const reply = await Reply.findById(replyId);

      // Check if the reply exists
      if (!reply) {
        // If reply doesn't exist, return a 404 response
        return res.status(404).json({ message: "Reply not found" });
      }

      if(!reply.upvotes)
      {
        reply.upvotes = [];
      }

      // Check if the user has already upvoted the reply
      const upvoteIndex = reply.upvotes ? reply.upvotes.indexOf(userId) : -1;
      if (upvoteIndex > -1) {
        // If user has already upvoted the reply, remove the upvote
        reply.upvotes.splice(upvoteIndex, 1);
      } else {
        // If user hasn't upvoted the reply, check if they have downvoted it
        const downvoteIndex = reply.downvotes
          ? reply.downvotes.indexOf(userId)
          : -1;
        if (downvoteIndex > -1) {
          // If user has downvoted the reply, remove the downvote
          reply.downvotes.splice(downvoteIndex, 1);
        }
        // Add user's upvote to the reply
        reply.upvotes.push(userId);
      }

      // Save the updated reply
      await reply.save();

      // Send success response with the updated reply
      res.status(200).json({
        message: "Upvote status updated successfully",
        reply,
      });
    } catch (error) {
      // Log and handle errors
      console.error("Error updating upvote status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),
];

exports.downvote_reply = [
  // Authenticate user with JWT
  passport.authenticate("jwt", { session: false }),

  // Validate the "replyId" parameter
  param("replyId").notEmpty().withMessage("Reply ID is required"),

  asyncHandler(async (req, res, next) => {
    try {
      // Extract replyId and userId from the request
      const replyId = req.params.replyId;
      const userId = req.user._id;

      // Find the reply by its ID
      const reply = await Reply.findById(replyId);

      // Check if the reply exists
      if (!reply) {
        // If reply doesn't exist, return a 404 response
        return res.status(404).json({ message: "Reply not found" });
      }

      if (!reply.downvotes) {
        reply.downvotes = [];
      }

      // Check if the user has already downvoted the reply
      const downvoteIndex = reply.downvotes
        ? reply.downvotes.indexOf(userId)
        : -1;
      if (downvoteIndex > -1) {
        // If user has already downvoted the reply, remove the downvote
        reply.downvotes.splice(downvoteIndex, 1);
      } else {
        // If user hasn't downvoted the reply, check if they have upvoted it
        const upvoteIndex = reply.upvotes ? reply.upvotes.indexOf(userId) : -1;
        if (upvoteIndex > -1) {
          // If user has upvoted the reply, remove the upvote
          reply.upvotes.splice(upvoteIndex, 1);
        }
        // Add user's downvote to the reply
        reply.downvotes.push(userId);
      }

      // Save the updated reply
      await reply.save();

      // Send success response with the updated reply
      res.status(200).json({
        message: "Downvote status updated successfully",
        reply,
      });
    } catch (error) {
      // Log and handle errors
      console.error("Error updating downvote status:", error);
      res.status(500).json({ message: "Internal server error" });
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
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this reply" });
      }

      // Delete the reply
      const deletedReply = await Reply.findByIdAndDelete(replyId);

      // Return a success message and the deleted reply data
      res
        .status(200)
        .json({ message: "Reply deleted successfully", reply: deletedReply });
    } catch (error) {
      // Log the error and pass it to the error handler
      console.error("Error deleting reply:", error);
      next(error);
    }
  }),
];
