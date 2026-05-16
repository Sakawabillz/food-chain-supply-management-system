const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (payload, options = {}) => {
	if (!config.jwtSecret) {
		throw new Error("JWT secret is not configured");
	}

	return jwt.sign(payload, config.jwtSecret, {
		expiresIn: config.jwtExpiresIn,
		...options
	});
};