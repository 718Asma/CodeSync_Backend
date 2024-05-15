// multer.js

const multer = require("multer");

// File filter to accept only image files
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

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

// New multer storage configuration for discussion banner image
const discussionBannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/banner/"); // Destination folder for storing images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Use original filename
    },
});

// New multer storage configuration for post images
const postImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/post/"); // Destination folder for storing images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Use original filename
    },
});

// Initialize Multer with storage options for user profile image
const uploadProfileImage = multer({
    storage: profileImageStorage,
    fileFilter: imageFileFilter,
}).single("profileImage");

// Initialize Multer with storage options for cover image
const uploadCoverImage = multer({
    storage: coverImageStorage,
    fileFilter: imageFileFilter,
}).single("coverImage");

// Initialize Multer for discussion banner image
const uploadDiscussionBanner = multer({
    storage: discussionBannerStorage,
    fileFilter: imageFileFilter,
}).single("banner");

// Initialize Multer for post images
const uploadPostImages = multer({
    storage: postImagesStorage,
    fileFilter: imageFileFilter,
}).array("images", 5); // Limit to 5 images

module.exports = {
    uploadProfileImage,
    uploadCoverImage,
    uploadDiscussionBanner,
    uploadPostImages,
};
