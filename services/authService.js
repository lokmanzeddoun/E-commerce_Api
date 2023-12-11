const crypto = require("crypto");

const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createToken = require("../utils/createToken");

const sendEmail = require("../utils/sendEmail");

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

// @desc "authorization"

exports.allowedTo = (
	...roles // when we access a data of function that is outer  of function we call it (Closure)
) =>
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

// @desc forget password

// @desc Forget password
// @route POST api/v1/auth/forgetPassword
// @access Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
	// 1) Get user by email address;

	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(
			new ApiError(`There is no user with this email ${req.body.email}`, 404)
		);
	}
	// 2) If user exists , generate 6 digits and save it in db
	const resetCode = Math.floor(Math.random() * 900000 + 100000).toString();

	const hashedResetCode = crypto
		.createHash("sha256")
		.update(resetCode)
		.digest("hex");

	// save into db
	user.resetPasswordCode = hashedResetCode;
	user.resetPasswordExpire = Date.now() + 20 * 60 * 1000; // 20 minutes
	user.passwordResetVerified = false;
	await user.save();

	// 3) send reset code via email
	const message = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

    <div style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Password Reset</h2>
        <p style="color: #555;">Hello ${user.name},</p>

        <p style="color: #555;">You have requested to reset your password. Please use the following reset code:</p>

        <p style="color: #555;">
            <span style="display: inline-block; padding: 8px 12px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">${resetCode}</span>
        </p>

        <p style="color: #555;">If you did not request a password reset, please ignore this email.</p>

        <p style="color: #555;">Best regards,<br>Your Website Team</p>
    </div>

</div>`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Your reset code (Valid for 20 minutes)",
			message,
		});
	} catch (err) {
		console.log(resetCode);
		user.resetPasswordCode = undefined;
		user.resetPasswordExpire = undefined;
		user.passwordResetVerified = undefined;

		// await user.save();
		return next(
			new ApiError(
				"There is an error in the Sending Email . Please try again",
				500
			)
		);
	}
	res.status(200).json({
		success: true,
		message: "Reset code sent to your email",
	});
});

// @desc verify Reset code
// @route POST api/v1/auth/verifyResetCode
// @access Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
	// 1) Get the user based on the reset code
	const hashedResetCode = crypto
		.createHash("sha256")
		.update(req.body.resetCode)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordCode: hashedResetCode,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ApiError("Reset Code invalid or expired ", 404));
	}

	user.passwordResetVerified = true;

	await user.save();
	res.status(200).json({ status: "success" });
});

// @desc Set new Password
// @route POST api/v1/auth/setPassword
// @access Public
exports.setNewPassword = asyncHandler(async (req, res, next) => {
	// 1) Get the user based on the email

	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(
			new ApiError(`There is no user with this email ${req.body.email}`, 404)
		);
	}
	// 2) check if the reset code is verified
	if (!user.passwordResetVerified) {
		return next(new ApiError("Please verify your reset code ", 404));
	}

	user.password = req.body.newPassword;
	user.resetPasswordCode = undefined;
	user.resetPasswordExpire = undefined;
	user.passwordResetVerified = undefined;
	await user.save();

	// 3) if everything is ok generate token
	const token = createToken(user._id);
	res.status(200).json({
		success: true,
		token,
	});
});
