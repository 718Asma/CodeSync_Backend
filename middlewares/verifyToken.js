const jwt = require("jsonwebtoken");

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];

    // Check if bearer is undefined
    if (!bearerHeader || typeof bearerHeader !== "string") {
        // Unauthorized - Token missing
        return res.status(401).send("Unauthorized - Token missing");
    }

    // Split at the space
    const bearer = bearerHeader.split(" ");

    // Check if the header has the correct format
    if (bearer.length !== 2 || bearer[0].toLowerCase() !== "bearer") {
        // Unauthorized - Invalid header format
        return res.status(401).send("Unauthorized - Invalid header format");
    }

    // Get token from array
    const bearerToken = bearer[1];

    // Set the token in the request object
    req.token = bearerToken;

    // Verify the token
    jwt.verify(bearerToken, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
        if (err) {
            // Unauthorized - Invalid token
            return res.status(401).send("Unauthorized - Invalid token");
        }

        // Token is valid, you can access the decoded information (e.g., user ID) using decoded variable
        req.userId = decoded.userId;

        // Move to the next middleware
        next();
    });
}

module.exports = verifyToken;
