const passport = require("passport");

const User = require("../models/user"); // Import your User model

require("dotenv").config();

let JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.ACCESS_JWT_SECRET;

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.user._id);
            if (!user) {
                return done(null, null);
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    })
);
