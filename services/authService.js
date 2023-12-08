const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");

const createToken = (payload) =>
	jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.ExpiresIn,
	});

// @desc Signup
// @route POST api/v1/auth/signup
// @access Public
exports.signUp = asyncHandler(async (req, res, next) => {
	// 1-Create user
	const user = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
	});

	// 2-Generate token
	const token = createToken(user._id);

	res.status(201).json({ data: user, token });
});
// @desc Login
// @route POST api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
	// 1) check the email and password in body
	// 2) check if the user are exist
	const user = await User.findOne({ email: req.body.email });
	if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
		return next(new ApiError("Invalid email or password"), 401);
	}
	// 3) generate jwt
	const token = createToken(user._id);

	// 4) send response to client
	res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
	// 1) check if token exist
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	if (!token)
		return next(
			new ApiError(
				"You are not log in , Please log in to access to this route ",
				401
			)
		);

	// 2) verify the token (no changes happen , expired token ) :: if change happen in the payload or the token is expired
	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

	// 3) verify if the user exist in database (this step is important when user is deleted by admin he also has the ability to access route because have the token )

	const user = await User.findById(decoded.userId);
	if (!user) {
		return next(
			new ApiError(
				"The user that belong to this token has no longer exist ",
				401
			)
		);
	}
	// 4) check if the user change the password after the creation of token
	if (user.changePasswordAt) {
		const passwordTimeStamp = parseInt(
			user.changePasswordAt.getTime() / 1000,
			10
		);
		// password change after the token created Error
		if (passwordTimeStamp > decoded.iat) {
			return next(
				new ApiError(
					"User recently changed his password , Please login again ...",
					401
				)
			);
		}
	}
	req.user = user;
	next();
});

exports.allowedTo = (...roles) =>  // when we access a data of function that is outer  of function we call it (Closure)
	// 1) access roles ;
	// 2) access user register ;
	asyncHandler(async (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ApiError("You are not allowed to access this route ", 403)
			);
		}
		next();
	});
