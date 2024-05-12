// multer.js

const multer = require("multer");

// Multer storage configuration for user profile image
const profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profile/"); // Specify the directory where user profile images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Rename files to avoid naming conflicts
    },
});

// Multer storage configuration for cover image
const coverImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/cover/"); // Specify the directory where cover images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Rename files to avoid naming conflicts
    },
});

// Initialize Multer with storage options for user profile image
const uploadProfileImage = multer({ storage: profileImageStorage }).single(
    "profileImage"
);

// Initialize Multer with storage options for cover image
const uploadCoverImage = multer({ storage: coverImageStorage }).single(
    "coverImage"
);

module.exports = { uploadProfileImage, uploadCoverImage };
