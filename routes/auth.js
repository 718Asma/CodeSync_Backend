let express = require("express");
let router = express.Router();
let authController = require("../controllers/authController");

require("dotenv").config();

// get requests for pages are handled by the frontend, access depends on the user's authentication status ( using the token )
router.get("/verify-token", authController.verify_token);

router.post("/login", authController.login_post);

router.post("/signup", authController.signup_post);

router.post("/refresh-token", authController.refresh_token);

router.post("/google", authController.google_post);

module.exports = router;
