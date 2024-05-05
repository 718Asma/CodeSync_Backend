const socketIO = require("socket.io");
require("dotenv").config();

// Store user IDs and socket IDs
let userSockets = new Map();

function initializeSocket(server) {
    const io = socketIO(3001, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("connect to socket", socket.id);

        // Listen for user joining and store their socket ID
        socket.on("add-user", (userId) => {
            userSockets.set(userId, socket.id);
            console.log("user added", userId, socket.id);
        });

        // Listen for sending messages
        socket.on("send-msg", (data) => {
            console.log("send-msg", data);
            console.log(userSockets);
            const recipientSocket = userSockets.get(data.receiver);

            if (recipientSocket) {
                // If recipient is online, emit message event
                io.to(recipientSocket).emit("msg-receive", data.content);
                console.log("msg-receive", data.content);
            } else {
                // If recipient is not online, you can handle offline message storage or other actions
                console.log(
                    `User ${data.receiver} is offline. Message not sent.`
                );
            }
        });

        // Listen for sending notifications
        socket.on("send-notification", (data) => {
            const recipientSocket = userSockets.get(data.receiver);
            if (recipientSocket) {
                // If recipient is online, emit notification event
                io.to(recipientSocket).emit(
                    "notification-receive",
                    data.content
                );
            } else {
                // If recipient is not online, you can handle offline notification storage or other actions
                console.log(
                    `User ${data.receiver} is offline. Notification not sent.`
                );
            }
        });
    });
}

module.exports = initializeSocket;
