const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const { body, param, validationResult } = require("express-validator");
const User = require("../models/user");
const { OpenAI, Configuration } = require("openai");

const passport = require("passport");
require("../strategies/local");
require("../strategies/jwt");

require("dotenv").config();

const userExists = async (value) => {
    const user = await User.findById(value);
    if (!user) {
        throw new Error("No user found with this ID");
    }
};

exports.ai_generate_response = [
    passport.authenticate("jwt", { session: false }),
    body("prompt").notEmpty().withMessage("Prompt is required"),
    body("aiKey").notEmpty().withMessage("AI key is required"),
    asyncHandler(async (req, res) => {
        if (validationResult(req).errors.length > 0) {
            return res
                .status(400)
                .json({ message: "Prompt and AI key are required" });
        }

        const { prompt, aiKey } = req.body;

        // Validate AI key
        if (!aiKey) {
            return res.status(400).json({ message: "AI key is required" });
        }

        // Initialize OpenAI with user's AI key

        let openai = new OpenAI({
            apiKey: aiKey,
        });
        try {
            // Create chat completion with user's key and prompt
            console.log("creating chat completion");
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            });

            // Extract and send the first message from GPT response
            const message = response.data.choices[0].message.content;
            res.status(200).json({ message });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.send_message = [
    passport.authenticate("jwt", { session: false }),
    body("receiver")
        .notEmpty()
        .withMessage("Receiver ID is required")
        .custom(userExists),
    body("content").notEmpty().withMessage("Message content is required"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { receiver, content } = req.body;
        const sender = req.user._id; // Extract the sender's ID from the JWT

        const message = new Message({
            sender,
            receiver,
            content,
        });

        await message.save();
        return res.status(200).json({ message: "Message sent", message: message });
    }),
];

exports.get_messages = [
    passport.authenticate("jwt", { session: false }),
    param("receiverId")
        .notEmpty()
        .withMessage("Receiver ID is required")
        .custom(userExists),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const receiverId = req.params.receiverId;
        const senderId = req.user._id;

        // Retrieve messages from the database
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order

        res.json(messages);
    }),
];

exports.delete_message = [
    passport.authenticate("jwt", { session: false }),
    param("messageId").notEmpty().withMessage("Message ID is required"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const messageId = req.params.messageId;
        const userId = req.user._id;

        // Check if the message exists and the user is the sender
        const message = await Message.findOne({
            _id: messageId,
            sender: userId,
        });

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        res.json({ message: "Message deleted" });
    }),
];

exports.update_message = [
    passport.authenticate("jwt", { session: false }),
    body("content").notEmpty().withMessage("Message content is required"),
    param("messageId").notEmpty().withMessage("Message ID is required"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const messageId = req.params.messageId;
        const userId = req.user._id;

        // Check if the message exists and the user is the sender
        const message = await Message.findOne({
            _id: messageId,
            sender: userId,
        });

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Update the message content
        message.content = req.body.content;
        message.lastModified = Date.now();
        await message.save();

        res.json({ message: "Message updated" });
    }),
];

// get all the user ids of the users that has sent a message to the user, or the user has sent a message to
exports.get_user_contacts = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res, next) => {
        const userId = req.user._id;
        // Find all the unique sender and receiver IDs in the messages collection
        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }],
                },
            },
            {
                $group: {
                    _id: null,
                    users: { $addToSet: "$sender" },
                    receivers: { $addToSet: "$receiver" },
                },
            },
            {
                $project: {
                    contacts: { $setUnion: ["$users", "$receivers"] },
                },
            },
            {
                $project: {
                    contacts: { $setDifference: ["$contacts", [userId]] },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "contacts",
                    foreignField: "_id",
                    as: "userObjects",
                },
            },
            {
                $project: {
                    "userObjects._id": 1,
                    "userObjects.fullName": 1,
                    "userObjects.profileImage": 1, // Include profileImage field
                },
            },
        ]);

        // Extract the unique contacts array from the aggregation result
        const uniqueContacts =
            contacts.length > 0 ? contacts[0].userObjects : [];
        //DONE: populate uniqueContacts with the user's full name, profile image

        res.status(200).json({ contacts: uniqueContacts });
    }),
];
