const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Load the swagger.yaml file
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

const setupSwagger = (app) => {
    // Define the Message schema in the components section
    swaggerDocument.components = {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            Message: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "60a5e41ef7b5d64fc805f8e9",
                    },
                    sender: {
                        type: "string",
                        description: "ID of the sender user",
                        example: "60a5e3f4f7b5d64fc805f8e8",
                    },
                    receiver: {
                        type: "string",
                        description: "ID of the receiver user",
                        example: "60a5e405f7b5d64fc805f8e9",
                    },
                    content: {
                        type: "string",
                        description: "Message content",
                        example: "Hello, how are you?",
                    },
                    timestamp: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp of when the message was sent",
                        example: "2023-05-18T10:00:00.000Z",
                    },
                    lastModified: {
                        type: "string",
                        format: "date-time",
                        description:
                            "Timestamp of when the message was last modified",
                        example: "2023-05-18T10:05:00.000Z",
                    },
                },
            },
            UserContact: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "60a5e41ef7b5d64fc805f8e9",
                    },
                    fullName: {
                        type: "string",
                        description: "Full name of the user",
                        example: "John Doe",
                    },
                    profileImage: {
                        type: "string",
                        description: "URL of the user's profile image",
                        example: "https://example.com/profile.jpg",
                    },
                },
            },
            UserProfileResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        example: "success",
                    },
                    data: {
                        $ref: "#/components/schemas/User",
                    },
                },
            },
            User: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        example: "60a5e41ef7b5d64fc805f8e9",
                    },
                    fullName: {
                        type: "string",
                        description: "User's full name",
                        example: "John Doe",
                    },
                    profileImage: {
                        type: "string",
                        description: "URL of the user's profile image",
                        example:
                            "/images/profiles/60a5e41ef7b5d64fc805f8e9.jpg",
                    },
                    coverImage: {
                        type: "string",
                        description: "URL of the user's cover image",
                        example: "/images/covers/60a5e41ef7b5d64fc805f8e9.jpg",
                    },
                    bio: {
                        type: "string",
                        description: "User's bio",
                        example: "Software Developer",
                    },
                    occupation: {
                        type: "string",
                        description: "User's occupation",
                        example: "Software Engineer",
                    },
                    gender: {
                        type: "string",
                        description: "User's gender",
                        example: "Male",
                    },
                    dateOfBirth: {
                        type: "string",
                        format: "date",
                        description: "User's date of birth",
                        example: "1990-01-01",
                    },
                    address: {
                        type: "string",
                        description: "User's address",
                        example: "123 Main St, Anytown, USA",
                    },
                    friends: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/UserContact",
                        },
                    },
                },
            },
            UserSearchResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        example: "success",
                    },
                    data: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/UserContact",
                        },
                    },
                },
            },
            UpdateProfileRequest: {
                type: "object",
                properties: {
                    fullName: {
                        type: "string",
                    },
                    bio: {
                        type: "string",
                    },
                    occupation: {
                        type: "string",
                    },
                    gender: {
                        type: "string",
                    },
                    dateOfBirth: {
                        type: "string",
                        format: "date",
                    },
                    address: {
                        type: "string",
                    },
                    email: {
                        type: "string",
                    },
                },
            },
        },
    };

    // Define security requirements for JWT authorization
    swaggerDocument.security = [
        {
            bearerAuth: [],
        },
    ];

    // Set up Swagger UI
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Set up Swagger JSON route
    app.get("/swagger.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerDocument);
    });
};

module.exports = setupSwagger;
