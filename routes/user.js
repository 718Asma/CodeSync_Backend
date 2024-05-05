let express = require("express");
let router = express.Router();
let userController = require("../controllers/userController");

/* GET users listing. */
router.get("/profile/:userId", userController.profile_get);

//get_all_my_info
router.get("/my-info/:userId", userController.get_all_my_info);

router.post("/add-friend/:userId", userController.add_friend_post); // userId is the friend's ID

router.post("/remove-friend/:userId", userController.remove_friend_post); // userId is the friend's ID

module.exports = router;
