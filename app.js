const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const swaggerSetup = require("./swagger/swaggerConfig");  

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// socket imports
const http = require("http");
const initializeSocket = require("./socket.io");
const server = http.createServer();

const passport = require("passport");
app.use(passport.initialize());

// Setup Swagger
swaggerSetup(app);


const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const messageRouter = require("./routes/message");
const discussionRouter = require("./routes/discussion");
const postRouter = require("./routes/post");
const replyRouter = require("./routes/reply");



// db connection
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// cors
app.use(
    cors({
        origin: process.env.FRONTEND_URL, // Allow requests from this origin
        // origin: "*",
        optionsSuccessStatus: 200, // legacy browsers choke on 204
        allowedHeaders: ["Content-Type", "Authorization", "authorization"],
    })
);

// socket.io (initialize in a separate file)
initializeSocket(server);

// const server = require("http").createServer(app);
// const io = require("socket.io")(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL,
//         methods: ["GET", "POST", "PUT", "DELETE"],
//     },
// });

app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// io.use((socket, next) => {
//     // const token = socket.handshake.auth.token;
//     const authHeader = socket.handshake.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return next(new Error("Authentication failed"));
//     }

//     const token = authHeader.split(" ")[1];
//     if (token) {
//         jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
//             if (err) {
//                 return next(new Error("Authentication error"));
//             }
//             // socket.decoded = decoded;
//             socket.userId = decoded.userId;
//             next();
//         });
//     } else {
//         next(new Error("Authentication error"));
//     }
// });

// routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/message", messageRouter);
app.use("/discussion", discussionRouter);
app.use("/post", postRouter);
app.use("/reply", replyRouter);



// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.status(500).json({ error: err.message });
});

module.exports = app;
