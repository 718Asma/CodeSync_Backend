const asyncHandler = require("express-async-handler");
const Discussion = require("../models/discussion");

exports.discussion_post = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const { creator, title, description, banner } = req.body;



        //Validation
        if (!creator || !title || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        try {
            const discussionData = {
                creator,
                participants: [creator], // Initialize participants with the creator
                title,
                description, 
            };

            if(banner) {
                discussionData.banner = banner;
            }

            const discussion = new Discussion(discussionData);

            await discussion.save();

            res.status(201).json({ message: "Discussion created successfully", discussion });
        } catch (error) {
            console.error("Error creating discussion:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
    ];

exports.get_discussions_by_user = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const userId = req.params.userId;

        try {
        // Find discussions where the specified user is the creator
        const discussions = await Discussion.find({ creator: userId });

        res.status(200).json({ discussions });
        } catch (error) {
        console.error("Error fetching discussions:", error);
        res.status(500).json({ message: "Internal server error" });
        }
    }),
];


exports.get_discussions_by_name = [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async (req, res) => {
        const name = req.query.name;

        try {
            const discussions = await Discussion.find({
                title: { $regex: name, $options: "i" },
        });

            res.status(200).json({ discussions });
        } catch (error) {
            console.error("Error fetching discussions:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
];
