const User = require("../models/user");

const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
let verifyToken = require("../middlewares/verifyToken");
// home redirections are handled by the frontend

const passport = require("passport");
require("../strategies/local");
require("../strategies/jwt");

require("dotenv").config();

const salt = process.env.SALT;
const access_secret = process.env.ACCESS_JWT_SECRET;
const refresh_secret = process.env.REFRESH_JWT_SECRET;
const frontend_url = process.env.FRONTEND_URL;

// returns a 200 status if the token is valid
exports.verify_token = [
    verifyToken,
    asyncHandler(async (req, res, next) => {
        // if you reach here, the token is valid
        return res.status(200).json({ success: "token is valid" });
    }),
];

exports.refresh_token = [
    asyncHandler(async (req, res, next) => {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res
                .status(403)
                .json({ message: "Refresh token is required" });
        }

        jwt.verify(refreshToken, refresh_secret, (err, decoded) => {
            if (err) {
                return res
                    .status(400)
                    .json({ message: "Invalid refresh token" });
            }

            let opts = {};
            opts.expiresIn = 3600; // 1Hr
            const access_token = jwt.sign(
                { user: decoded.user },
                access_secret,
                opts
            );

            return res.status(200).json({
                access_token: access_token,
            });
        });
    }),
];

// validate fields, authenticate user, create and add token in header and return it
exports.login_post = [
    body("username", "The username field is required.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .escape(),
    body("password", "The password field is required.")
        .trim()
        .isLength({ min: 8, max: 100 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // form errors
            res.status(400).json({ errors: errors.array() });
        }

        passport.authenticate("local", (err, user) => {
            if (err) {
                return next(err); // db query error
            }
            if (!user) {
                // auth failed
                return res
                    .status(400)
                    .json({ message: "Invalid username or password." });
            }

            let opts = {
                issuer: "localhost:3000",
                audience: "localhost:5173",
                expiresIn: "1h",
            };
            const access_token = jwt.sign({ user }, access_secret, opts);

            opts.expiresIn = "1y";
            const refresh_token = jwt.sign({ user }, refresh_secret, opts);

            return res.status(200).json({
                access_token: access_token,
                refresh_token: refresh_token,
                user_id: user._id,
            });
        })(req, res, next);
    }),
];

exports.google_post = [
    // add  validators on the  body (googleId and fullName)
    body("googleId", "Google ID is required.").trim().escape(),
    body("fullName", "Full name is required.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });

        const { googleId, fullName } = req.body;
        let user = await User.findOne({ googleId: googleId }).exec();
        if (!user) {
            let newUser = new User({
                googleId: googleId,
                fullName: fullName,
            });
            await newUser.save();
            user = newUser;
        }
        let opts = {
            issuer: "localhost:3000",
            audience: "localhost:5173",
            expiresIn: "1h",
        };
        const access_token = jwt.sign({ user }, access_secret, opts);

        opts.expiresIn = "1y";
        const refresh_token = jwt.sign({ user }, refresh_secret, opts);

        return res.status(200).json({
            access_token: access_token,
            refresh_token: refresh_token,
        });
    }),
];

// validate fields, create user, hash password, save user, redirect to login
exports.signup_post = [
    body("full_name", "Full name should consist of a minimum of 3 characters.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .escape()
        .matches(/^[\w\s'-]+$/)
        .withMessage(
            "Full name can only contain letters, spaces, hyphens, or apostrophes."
        ),

    body("username", "Username should consist of a minimum of 3 characters.")
        .trim()
        .isLength({ min: 3, max: 100 })
        .escape()
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric."),

    body("password", "Password should consist of a minimum of 8 characters.")
        .trim()
        .isLength({ min: 8, max: 100 })
        .escape()
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage(
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
        ),

    body("confirm_password", "Password confirmation must not be empty.")
        .trim()
        .isLength({ min: 8, max: 100 })
        .escape(),

    body("confirm_password").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password.");
        }
        return true;
    }),

    body("username").custom(async (value) => {
        const userWithSameUserName = await User.findOne({
            username: value,
        }).exec();
        if (userWithSameUserName) {
            throw new Error("Username already exists.");
        }
        return true;
    }),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });

        let user = new User({
            fullName: req.body.fullName,
            username: req.body.username,
            password: req.body.password,
        });

        bcrypt.hash(
            req.body.password,
            parseInt(salt),
            async (err, hashedPassword) => {
                if (err) return next(err);
                // otherwise, store hashedPassword in DB
                user.password = hashedPassword;
                await user.save();
            }
        );
        // create an access token and a refresh token
        let opts = {
            issuer: "localhost:3000",
            audience: "localhost:5173",
            expiresIn: "1h",
        };
        const access_token = jwt.sign({ user }, access_secret, opts);
        opts.expiresIn = "1y";
        const refresh_token = jwt.sign({ user }, refresh_secret, opts);

        res.status(200).json({
            access_token: access_token,
            refresh_token: refresh_token,
        });
    }),
];
