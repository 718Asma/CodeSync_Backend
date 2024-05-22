const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Route for sending a message
// POST /message/send
router.post("/send", messageController.send_message);

// Route for retrieving messages between two users
// GET /message/get/:receiverId
router.get("/get/:receiverId", messageController.get_messages);

// Route for deleting a message
// DELETE /message/delete/:messageId
router.delete("/delete/:messageId", messageController.delete_message);

// Route for updating a message
// PUT /message/update/:messageId
router.put("/update/:messageId", messageController.update_message);

// Route for retrieving user contacts
// GET /message/contacts
router.get("/contacts", messageController.get_user_contacts);

// Route for prompting ai to generate a response
// POST /message/ai
router.post("/ai", messageController.ai_generate_response);

module.exports = router;
