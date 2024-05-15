let express = require("express");
let router = express.Router();
let userController = require("../controllers/userController");

router.get("/profile/:userId", userController.profile_get);

// route to search users by name
router.get("/search-users", userController.search_users_get);

router.post("/upload-profile-image", userController.uploadUserProfileImage);

router.post("/upload-cover-image", userController.uploadCoverImage);

router.post("/update-profile-details", userController.update_profile_post);

router.post("/add-friend/:userId", userController.add_friend_post); // userId is the friend's ID

router.post("/remove-friend/:userId", userController.remove_friend_post); // userId is the friend's ID

module.exports = router;
