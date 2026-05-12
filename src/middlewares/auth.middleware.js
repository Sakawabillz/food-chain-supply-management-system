const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    if (!config.jwtSecret) {
      throw new Error("JWT secret is not configured");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not authorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};