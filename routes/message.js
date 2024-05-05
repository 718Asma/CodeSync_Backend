const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Route for sending a message
router.post("/send", messageController.send_message);

// Route for retrieving messages between two users
router.get("/get/:receiverId", messageController.get_messages);

// Route for deleting a message
router.delete("/delete/:messageId", messageController.delete_message);

// Route for updating a message
router.put("/update/:messageId", messageController.update_message);

router.get("/contacts", messageController.get_user_contacts);

module.exports = router;
