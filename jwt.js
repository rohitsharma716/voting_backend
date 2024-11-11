const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: "Token not found" });
    }

    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token data to request object
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        res.status(401).json({ error: "Invalid token" });
    }
};

// Function to generate JWT
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

module.exports = { jwtAuthMiddleware, generateToken };
