let express = require("express");
let router = express.Router();
let userController = require("../controllers/userController");

/* GET users listing. */
router.get("/profile/:userId", userController.profile_get);

module.exports = router;
