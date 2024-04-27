const asyncHandler = require("express-async-handler");

const passport = require("passport");
require("../strategies/local");
require("../strategies/jwt");

require("dotenv").config();

// return a json message (protected route)
exports.homepage_get = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        res.status(200).json({
            message: "Welcome to the protected homepage",
            userId: req.user._id,
        });
    }),
];
