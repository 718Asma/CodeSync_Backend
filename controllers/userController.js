const User = require("../models/user");

const asyncHandler = require("express-async-handler");

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
