// postController.js
const Post = require("../models/post");
const Discussion = require("../models/discussion");
const Reply = require("../models/reply");

const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const passport = require("passport");
const { uploadPostImages } = require("../multer");

require("../strategies/local");
require("../strategies/jwt");

exports.uploadPostImages = [
    passport.authenticate("jwt", { session: false }),
    body("postId").notEmpty().withMessage("Post ID is required"),
    asyncHandler(async (req, res) => {
        uploadPostImages(req, res, async (err) => {
            if (err) {
                console.error("Error uploading post images:", err);
                return res.status(400).json({
                    message: "Error uploading post images",
                    error: err,
                });
            }
            let images = [];
            if (req.files) {
                // If files were uploaded, store their paths
                images = req.files.map((file) => file.path);
            }

            try {
                const post = await Post.findById(req.body.postId).populate("owner");
                if (!post) {
                    return res.status(404).json({ message: "post not found" });
                }
                post.images = images;
                await post.save();

                res.status(200).json({
                    message: "Post images uploaded successfully",
                    post,
                });
            } catch (error) {
                console.error("Error uploading Post images:", error);
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }
        });
    }),
];

exports.create_post = [
    passport.authenticate("jwt", { session: false }),
    // uploadPostImages, // Handle multiple image uploads, up to 5 images
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

            // let images = [];
            // if (req.files) {
            //     // If files were uploaded, store their paths
            //     images = req.files.map((file) => file.path);
            // }

            // Create a new post
            const post = new Post({
                owner,
                discussionId,
                content,
                // images,
            });

            // Save the post to the database
            await post.save();

            res.status(201).json({
                message: "Post created successfully",
                post,
            });
        } catch (error) {
            console.error("Error creating post:", error);
            next(error);
        }
    }),
];

exports.get_posts = [
    passport.authenticate("jwt", { session: false }),
    param('per_page').optional().isInt({ min: 1 }).withMessage('per_page must be a positive integer and greater than 0'),
    param('page').optional().isInt({ min: 0 }).withMessage('page must be a positive integer'),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const perPage = parseInt(req.query.per_page, 10);
        const page = parseInt(req.query.page, 10);

        try {
            const posts = await Post.find({})
            .populate({
                path: 'owner',
                populate: {
                    path: 'friends',
                    select: 'fullName profileImage'
                }
            })
            .populate('discussionId', 'title banner')
            .sort({ timestamp: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);
            const nbPosts = await Post.countDocuments();

            if (posts.length === 0) {
                return res.status(200).json({ message: "No posts found" });
            }
            res.status(200).json({ posts, nbPosts });
        } catch (error) {
            console.error("Error fetching posts:", error);
            next(error);
        }
    }),
];

exports.get_post_by_creator = [
    passport.authenticate("jwt", { session: false }),
    param("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("Invalid User ID format"),
    param("per_page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("per_page must be a positive integer and greater than 0"),
    param("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("page must be a positive integer"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.params;
        const perPage = parseInt(req.query.per_page, 10) || 10; // Default to 10 posts per page
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1

        try {
            // Find posts where the specified user is the owner
            const posts = await Post.find({ owner: userId })
                .populate({
                    path: 'owner',
                    populate: {
                        path: 'friends',
                        select: 'fullName profileImage'
                    }
                })
                .populate('discussionId', 'title banner')
                .sort({ timestamp: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);

            if (posts.length === 0) {
                return res.status(200).json({ message: `User with ID ${userId} has no posts` });
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
    param('per_page').optional().isInt({ min: 1 }).withMessage('per_page must be a positive integer and greater than 0'),
    param('page').optional().isInt({ min: 0 }).withMessage('page must be a positive integer'),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const perPage = parseInt(req.query.per_page, 10);
        const page = parseInt(req.query.page, 10);

        try {
            const discussionId = req.params.discussionId; // Retrieve discussion ID from URL params

            // Find posts belonging to the specified discussion
            const posts = await Post.find({ discussionId: discussionId })
                .populate({
                    path: 'owner',
                    populate: {
                        path: 'friends',
                        select: 'fullName profileImage'
                    }
                })
                .populate('discussionId', 'title banner')
                .sort({ timestamp: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);

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

exports.get_post_by_id = [
    passport.authenticate("jwt", { session: false }),
    param("postId").notEmpty().withMessage("Post ID is required"),
    asyncHandler(async (req, res, next) => {
        try {
            const postId = req.params.postId; // Extract post ID from URL params
            
            const post = await Post.findById(postId)
            .populate('discussionId', 'title banner')
            .populate({
                path: 'owner',
                populate: {
                    path: 'friends',
                    select: 'fullName profileImage'
                }
            }); // Find post by ID

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            
            res.status(200).json({ post });
        } catch (error) {
            console.error("Error fetching post by ID:", error);
            next(error);
        }
    }),
];

exports.get_posts_from_participated_discussions = [
    passport.authenticate("jwt", { session: false }),
    param('per_page').optional().isInt({ min: 1 }).withMessage('per_page must be a positive integer greater than 0'),
    param('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer greater than 0'),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const perPage = req.query.per_page ? parseInt(req.query.per_page, 10) : 10; // default perPage
        const page = req.query.page ? parseInt(req.query.page, 10) : 1; // default page

        try {
            const userId = req.user._id; // Extract user ID from JWT payload

            // Find discussions where the user is a participant
            const discussions = await Discussion.find({
                participants: userId,
            }).select('_id');

            const discussionIds = discussions.map(discussion => discussion._id);

            // Find posts belonging to these discussions
            const posts = await Post.find({ discussionId: { $in: discussionIds } })
                .populate({
                    path: 'owner',
                    populate: {
                        path: 'friends',
                        select: 'fullName profileImage'
                    }
                })
                .populate('discussionId', 'title banner')
                .sort({ timestamp: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage);

            if (posts.length === 0) {
                return res.status(200).json({ message: "No posts found for the discussions the user participates in" });
            }

            res.status(200).json({ posts });
        } catch (error) {
            console.error("Error fetching posts from participated discussions:", error);
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
                const dislikeIndex = post.dislikes
                    ? post.dislikes.indexOf(userId)
                    : -1;
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