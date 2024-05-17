let express = require("express");
let router = express.Router();
let authController = require("../controllers/authController");

require("dotenv").config();

// Route to verify token
// GET /auth/verify-token
// Requires JWT authentication
router.get("/verify-token", authController.verify_token);

// Route to log in
// POST /auth/login
router.post("/login", authController.login_post);

// Route to sign up
// POST /auth/signup
router.post("/signup", authController.signup_post);

// Route to refresh token
// POST /auth/refresh-token
router.post("/refresh-token", authController.refresh_token);

// Route to handle Google login/signup
// POST /auth/google
router.post("/google", authController.google_post);

module.exports = router;
