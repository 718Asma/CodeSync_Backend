// discussionController.js

const asyncHandler = require("express-async-handler");
const Discussion = require("../models/discussion");
const { body, query, param, validationResult } = require("express-validator");
const passport = require("passport");
const { uploadDiscussionBanner } = require("../multer");

require("../strategies/local");
require("../strategies/jwt");

exports.uploadDiscussionBanner = [
    passport.authenticate("jwt", { session: false }),
    body("discussionId").notEmpty().withMessage("Discussion ID is required"),
    asyncHandler(async (req, res) => {
        uploadDiscussionBanner(req, res, async (err) => {
            if (err) {
                console.error("Error uploading discussion banner:", err);
                return res.status(400).json({
                    message: "Error uploading cover image",
                    error: err,
                });
            }
            const filePath = req.file.path;
            try {
                const discussion = await Discussion.findById(
                    req.body.discussionId
                );
                if (!discussion) {
                    return res
                        .status(404)
                        .json({ message: "Discussion not found" });
                }
                discussion.banner = filePath;
                await discussion.save();

                res.status(200).json({
                    message: "Discussion banner uploaded successfully",
                    discussion,
                });
            } catch (error) {
                console.error("Error uploading discussion banner:", error);
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }
        });
    }),
];

exports.get_discussion_by_id = [
    passport.authenticate("jwt", { session: false }),
    param("discussionId").notEmpty().withMessage("Discussion ID is required"),
    asyncHandler(async (req, res) => {
        try {
            const discussionId = req.params.discussionId; // Extract discussion ID from URL parameter

            const discussion = await Discussion.findById(discussionId)
                .populate("creator", "fullName profileImage _id")
                .populate("participants", "fullName profileImage _id");
            if (!discussion) {
                return res
                    .status(404)
                    .json({ message: "Discussion not found" });
            }

            res.status(200).json({ discussion });
        } catch (error) {
            console.error("Error fetching discussion by ID:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.discussion_post = [
    passport.authenticate("jwt", { session: false }),
    body("title")
        .notEmpty()
        .isLength({ min: 5, max: 50 })
        .withMessage("Title must be between 5 and 50 characters"),
    body("description")
        .notEmpty()
        .isLength({ min: 5, max: 100 })
        .withMessage("Description must be between 5 and 100 characters"),
    asyncHandler(async (req, res, next) => {
        try {
            const { title, description } = req.body;
            const creator = req.user._id; // Extract creator from JWT

            // Validation errors handling
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log("Validation errors:", errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            // console.log("File:", req.file);
            //NOTE: I changed it to not include the banner in the discussion creation
            const discussion = new Discussion({
                creator,
                title,
                description,
            });

            // Check if a file was uploaded
            // if (req.file) {
            //     const banner = req.file.path; // Get the path of the uploaded file
            //     discussion.banner = banner; // Set the banner field to the file path
            // }
            console.log("Discussion:", discussion);

            // Create discussion

            // Save discussion to database
            await discussion.save();

            res.status(201).json({
                message: "Discussion created successfully",
                discussion,
            });
        } catch (error) {
            console.error("Error creating discussion:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.get_discussions = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        try {
            const discussions = await Discussion.find();

            res.status(200).json({ discussions });
        } catch (error) {
            console.error("Error fetching discussions:", error);
            next(error);
        }
    }),
];

exports.get_discussions_by_user = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        try {
            const userId = req.user._id; // Extract user ID from JWT payload

            // Find discussions where the specified user is the creator
            const discussions = await Discussion.find({ creator: userId });

            // If user has discussions, return them
            res.status(200).json({ discussions });
        } catch (error) {
            console.error("Error fetching discussions:", error);
            next(error); // Pass the error to the error handling middleware
        }
    }),
];

exports.get_discussions_by_name = [
    passport.authenticate("jwt", { session: false }),
    query("name")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 5 and 50 characters long"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.query; // Extract name from query parameters

        try {
            // Find discussions with titles matching the provided name (case-insensitive)
            const discussions = await Discussion.find({
                title: { $regex: name, $options: "i" },
            });

            if (discussions.length === 0) {
                // If no discussions match the provided name, return a message
                return res.status(404).json({
                    message: "No discussions found with the specified name",
                    discussions: [],
                });
            }

            // If discussions are found, return them
            res.status(200).json({ discussions });
        } catch (error) {
            console.error("Error fetching discussions:", error);
            next(error); // Pass the error to the error handling middleware
        }
    }),
];

exports.join_leave_disc = [
    passport.authenticate("jwt", { session: false }),
    param("discussionId").notEmpty().withMessage("Discussion ID is required"),
    asyncHandler(async (req, res, next) => {
        try {
            const discussionId = req.params.discussionId; // Assuming the discussion ID is passed as a URL parameter
            const userId = req.user._id; // Extract user ID from JWT

            const discussion = await Discussion.findById(discussionId);
            if (!discussion) {
                return res
                    .status(404)
                    .json({ message: "Discussion not found" });
            }

            const participantIndex = discussion.participants.indexOf(userId);
            if (participantIndex > -1) {
                // User is already a participant, remove them
                discussion.participants.splice(participantIndex, 1);
            } else {
                // User is not a participant, add them
                discussion.participants.push(userId);
            }

            await discussion.save();

            res.status(200).json({
                message: "Participant status updated successfully",
                discussion,
            });
        } catch (error) {
            console.error("Error updating participant status:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
];
