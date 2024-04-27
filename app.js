const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const passport = require("passport");
app.use(passport.initialize());

const homeRouter = require("./routes/home");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");

// db connection
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// cors
app.use(
    cors({
        origin: process.env.FRONTEND_URL, // Allow requests from this origin
        optionsSuccessStatus: 200, // legacy browsers choke on 204
        allowedHeaders: ["Content-Type", "Authorization", "authorization"],
    })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use("/auth", authRouter);
app.use("/", homeRouter);
app.use("/user", userRouter);

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
