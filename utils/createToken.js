const jwt = require("jsonwebtoken");

const createToken = (payload) =>
	jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.ExpiresIn,
	});

module.exports = createToken;
