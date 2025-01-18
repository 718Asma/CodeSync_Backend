let express = require("express");
let router = express.Router();
let userController = require("../controllers/userController");

// Get user profile by user ID
router.get("/profile/:userId", userController.profile_get);

// Search users by name
router.get("/search-users", userController.search_users_get);

// Upload user profile image
router.post("/upload-profile-image", userController.uploadUserProfileImage);

// Upload cover image
router.post("/upload-cover-image", userController.uploadCoverImage);

// Update profile details
router.post("/update-profile-details", userController.update_profile_post);

// Add a friend by user ID
router.post("/add-friend/:userId", userController.add_friend_post); // userId is the friend's ID

// Remove a friend by user ID
router.post("/remove-friend/:userId", userController.remove_friend_post); // userId is the friend's ID

// Add a post to saved posts by post ID
router.post("/save-post/:postId", userController.save_post_post); // postId is the post's ID

// Delete a post from saved posts by post ID
router.post("/unsave-post/:postId", userController.unsave_post_post); // postId is the post's ID

// Get user's saved posts
router.get("/saved-posts/", userController.get_saved_posts);

// Delete own account
router.post("/delete-account", userController.delete_account_post);

// Change password
router.post("/change-password", userController.change_password_post);

module.exports = router;