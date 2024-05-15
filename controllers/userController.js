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

exports.search_users_get = [
    passport.authenticate("jwt", { session: false }),
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
            return res.status(200).json({
                status: "success",
                data: users,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
];

/* 
//TODO: implement the following route ( discuss with the team first )
for the idea of integrating google acc + local acc:
posts, replies, discussions, reacts(dislikes, likes, upvotes and downvote) ownership will be transferred to the new account
messages: either they get merged ( might cause issues with the order of messages) or they are lost in the process
friends: the new account will have the friends of the old account 
profile info: the new account will have the profile info of the old account
profile image: the new account will have the profile image of the old account
profile cover: the new account will have the profile cover of the old account
naturally, all of the old account data will be deleted
*/
