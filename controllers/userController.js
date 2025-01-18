const User = require("../models/user");
const Post = require("../models/post");

const asyncHandler = require("express-async-handler");
const { uploadProfileImage, uploadCoverImage } = require("../multer");

const passport = require("passport");
require("../strategies/local");
require("../strategies/jwt");

require("dotenv").config();

const bcrypt = require("bcryptjs");
const { body, param, validationResult, query } = require("express-validator");

const salt = process.env.SALT;

// get user data by userId (jwt verification + rediraction if not logged in)
exports.profile_get = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        const userId = req.params.userId;
        if (!userId) {
            // bad request
            return res.status(400).json({ message: "User ID is required" });
        }
        try {
            // populate friends with their names, ids and profileImages
            const user = await User.findById(userId).populate(
                "friends",
                "_id fullName profileImage"
            );

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // remove password, username, googleId from the user object
            user.password = undefined;
            user.username = undefined;
            user.googleId = undefined;

            return res.status(200).json({
                status: "success",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

// exports.add_friend_post = [
//     passport.authenticate("jwt", { session: false }),
//     param("userId").isMongoId().withMessage("Invalid user ID format"),
//     asyncHandler(async (req, res, next) => {
//         const friendId = req.params.userId;
//         if (!friendId) {
//             // bad request
//             return res.status(400).json({ message: "User ID is required" });
//         }
//         try {
//             const friend = await User.findById(friendId);
//             if (!friend) {
//                 return res.status(404).json({ message: "User not found" });
//             }
//             const user = await User.findById(req.user._id);
//             if (!user) {
//                 return res.status(404).json({ message: "User not found" });
//             }
//             // check if the user is already a friend
//             if (user.friends.includes(friendId)) {
//                 return res.status(400).json({ message: "Already friends" });
//             }

//             user.friends.push(friendId);
//             friend.friends.push(req.user._id);
//             await Promise.all([user.save(), friend.save()]);
//             // await user.save();
//             return res.status(200).json({
//                 status: "success",
//                 data: user,
//             });
//         } catch (error) {
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     }),
// ];

exports.remove_friend_post = [
    passport.authenticate("jwt", { session: false }),
    param("userId").isMongoId().withMessage("Invalid user ID format"),
    asyncHandler(async (req, res, next) => {
        const friendId = req.params.userId;

        try {
            // Find the friend by ID
            const friend = await User.findById(friendId);
            if (!friend) {
                return res.status(404).json({ message: "Friend not found" });
            }

            // Find the authenticated user
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "Authenticated user not found" });
            }

            // Remove friend from the user's friends array
            user.friends = user.friends.filter((elt) => elt._id.toString() !== friendId);

            // Also remove the authenticated user from the friend's friends array
            friend.friends = friend.friends.filter((elt) => elt._id.toString() !== req.user._id.toString());

            // Save the updates
            await user.save();
            await friend.save();

            return res.status(200).json({
                status: "success",
                message: "Friend removed successfully",
                data: user,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }),
];

exports.uploadUserProfileImage = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        uploadProfileImage(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    message: "Error uploading profile image",
                    error: err,
                });
            }
            const filePath = req.file.path;
            try {
                let user = await User.findById(req.user._id);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                user.profileImage = filePath;
                await user.save(); // Save the updated user object

                // Save filePath to user's profile in your database
                res.status(200).json({
                    message: "Profile image uploaded successfully",
                    filePath,
                });
            } catch (error) {
                console.error("Error saving profile image path:", error);
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }
        });
    }),
];

exports.uploadCoverImage = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        uploadCoverImage(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    message: "Error uploading cover image",
                    error: err,
                });
            }
            const filePath = req.file.path;
            try {
                let user = await User.findById(req.user._id);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                user.coverImage = filePath;
                await user.save(); // Save the updated user object

                // Respond with success message and file path
                res.status(200).json({
                    message: "Cover image uploaded successfully",
                    filePath,
                });
            } catch (error) {
                console.error("Error saving cover image path:", error);
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }
        });
    }),
];

exports.update_profile_post = [
    passport.authenticate("jwt", { session: false }),
    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Full name must be between 3 and 100 characters"),
    body("bio")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Bio must be up to 500 characters"),
    body("occupation")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Occupation must be up to 100 characters"),
    body("gender")
        .optional()
        .trim()
        .isIn(["Male", "Female", "Other"])
        .withMessage("Gender must be Male, Female, or Other"),
    body("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Date of Birth must be a valid date"),
    body("address")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Address must be up to 200 characters"),
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .isLength({ max: 100 })
        .withMessage("Email must be up to 100 characters"),
    asyncHandler(async (req, res) => {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user._id; // Get user ID from passport verification middleware

        // Extract updated profile information from request body
        const {
            fullName,
            bio,
            occupation,
            gender,
            dateOfBirth,
            address,
            email,
        } = req.body;

        try {
            // Find the user by ID
            let user = await User.findById(userId);

            // If user not found, return error
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Update user profile information
            if (fullName) user.fullName = fullName;
            if (bio) user.bio = bio;
            if (occupation) user.occupation = occupation;
            if (gender) user.gender = gender;
            if (dateOfBirth) user.dateOfBirth = dateOfBirth;
            if (address) user.address = address;
            if (email) user.email = email;

            // Save the updated user object
            await user.save();

            // Respond with success message and updated user object
            res.status(200).json({
                message: "Profile updated successfully",
                user,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.search_users_get = [
    passport.authenticate("jwt", { session: false }),
    query("name").notEmpty().trim().escape(),
    asyncHandler(async (req, res) => {
        const query = req.query.name;
        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }
        try {
            // only get their names, ids and profile images
            const users = await User.find(
                { fullName: { $regex: query, $options: "i" } },
                "_id fullName profileImage"
            );
            // if current user is in the search results, remove them
            const currentUserIndex = users.findIndex(
                (user) => user._id == req.user._id
            );
            if (currentUserIndex > -1) {
                users.splice(currentUserIndex, 1);
            }
            return res.status(200).json({
                status: "success",
                data: users,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.save_post_post = [
    passport.authenticate("jwt", { session: false }),
    param("postId").isMongoId().withMessage("Invalid post ID format"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    asyncHandler(async (req, res) => {
        const postId = req.params.postId;
        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.savedPosts.push(postId);
            await user.save();
            return res.status(200).json({
                status: "success",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.unsave_post_post = [
    passport.authenticate("jwt", { session: false }),
    param("postId").isMongoId().withMessage("Invalid post ID format"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    asyncHandler(async (req, res) => {
        const postId = req.params.postId;
        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.savedPosts = user.savedPosts.filter((p) => p != postId);
            await user.save();
            return res.status(200).json({
                status: "success",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.get_saved_posts = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const perPage = parseInt(req.query.per_page);
        const page = parseInt(req.query.page);

        try {
            const user = await User.findById(req.user._id)
                .populate({
                    path: "savedPosts",
                    options: {
                        sort: { timestamp: -1 },
                        limit: perPage,
                        skip: (page - 1) * perPage,
                    },
                    populate: {
                        path: "owner",
                    },
                })
                .exec();

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({
                status: "success",
                data: user.savedPosts,
            });
        } catch (error) {
            console.error("Error retrieving saved posts:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.delete_account_post = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            await User.findByIdAndDelete(req.user._id);
            return res.status(200).json({ message: "Account deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.change_password_post = [
    passport.authenticate("jwt", { session: false }),
    body("oldPassword", "Old password is required").notEmpty().trim().escape(),
    body(
        "newPassword",
        "New Password should consist of a minimum of 8 characters."
    )
        .trim()
        .isLength({ min: 8, max: 100 })
        .escape()
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage(
            "New Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
        ),

    body("confirmNewPassword", "Password confirmation must not be empty.")
        .trim()
        .isLength({ min: 8, max: 100 })
        .escape(),

    body("confirmNewPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error(
                "Password confirmation does not match the new password."
            );
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // check if the old password is correct using bcrypt
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid password" });
            }
            // hash the new password and save it
            bcrypt.hash(
                newPassword,
                parseInt(salt),
                async (err, hashedPassword) => {
                    if (err) return next(err);
                    // otherwise, store hashedPassword in DB
                    user.password = hashedPassword;
                    await user.save();
                }
            );
            return res.status(200).json({ message: "Password changed" });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];