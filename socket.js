// socket.js

const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

require("dotenv").config();

const server = require("http").createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

// Use JWT authentication middleware
io.use((socket, next) => {
    // const token = socket.handshake.auth.token;
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Authentication failed"));
    }

    const token = authHeader.split(" ")[1];
    if (token) {
        jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error"));
            }
            // socket.decoded = decoded;
            socket.userId = decoded.userId;
            next();
        });
    } else {
        next(new Error("Authentication error"));
    }
});

// Handle socket connections and disconnections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.userId);

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.userId);
    });
});

// Export the initialized Socket.IO instance
module.exports = io;
