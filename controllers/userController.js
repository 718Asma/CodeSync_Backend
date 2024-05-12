const User = require("../models/user");

const asyncHandler = require("express-async-handler");
const { uploadProfileImage, uploadCoverImage } = require("../multer");

const passport = require("passport");
require("../strategies/local");
require("../strategies/jwt");

require("dotenv").config();

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
            // populate friends with their names
            const user = await User.findById(userId).populate(
                "friends",
                "fullName"
            );
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({
                status: "success",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.add_friend_post = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        const friendId = req.params.userId;
        if (!friendId) {
            // bad request
            return res.status(400).json({ message: "User ID is required" });
        }
        try {
            const friend = await User.findById(friendId);
            if (!friend) {
                return res.status(404).json({ message: "User not found" });
            }
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.friends.push(friendId);
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

exports.remove_friend_post = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        const friendId = req.params.userId;
        if (!friendId) {
            // bad request
            return res.status(400).json({ message: "User ID is required" });
        }
        try {
            const friend = await User.findById(friendId);
            if (!friend) {
                return res.status(404).json({ message: "User not found" });
            }
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.friends = user.friends.filter((f) => f != friendId);
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

//get user by id
exports.get_all_my_info = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        const userId = req.params.userId;
        if (!userId) {
            // bad request
            return res.status(400).json({ message: "User ID is required" });
        }
        if (userId != req.user._id) {
            // unauthorized
            return res.status(403).json({ message: "Unauthorized" });
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({
                status: "success",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
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
    asyncHandler(async (req, res) => {
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
            // if (email) user.email = email; //TODO: add email verification before updating email

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
