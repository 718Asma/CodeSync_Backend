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
        // socket.on("add-user", (userId) => {
        //     userSockets.set(userId, socket.id);
        //     console.log("user added", userId, socket.id);
        // });
        socket.on("add-user", (userId) => {
            userSockets.set(userId, socket.id);
            console.log("user added", userId, socket.id);

            // Notify the newly connected user of the current online users
            socket.emit("current-online-users", Array.from(userSockets.keys()));

            // Broadcast to all other users that this user is online
            socket.broadcast.emit("update-user-status", {
                userId,
                status: "online",
            });
        });

        socket.on("disconnect", () => {
            const userId = [...userSockets].find(
                ([key, value]) => value === socket.id
            )?.[0];
            if (userId) {
                userSockets.delete(userId);
                io.emit("update-user-status", { userId, status: "offline" });
            }
        });

        // Listen for sending messages
        socket.on("send-msg", (data) => {
            console.log("send-msg", data);
            const recipientSocket = userSockets.get(data.receiver);
            if (recipientSocket) {
                console.log(
                    "recipientSocket found, emitting msg at:",
                    recipientSocket
                );
                io.to(recipientSocket).emit("msg-receive", {
                    sender: data.sender,
                    receiver: data.receiver,
                    content: data.content,
                });
                console.log("msg-receive", data.content);
            } else {
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
