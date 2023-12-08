// CRUD OPERATION OF USER
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/userModel");
const factory = require("./handlerFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddlewares");
const { default: slugify } = require("slugify");
const ApiError = require("../utils/ApiError");

exports.uploadUserImage = uploadSingleImage("profileImg");

// Processing the image
exports.resizeImage = asyncHandler(async (req, res, next) => {
	const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
	if (req.file) {
		await sharp(req.file.buffer)
			.resize(600, 600)
			.toFormat("jpeg")
			.jpeg({ quality: 90 })
			.toFile(`uploads/users/${filename}`);
		// save image as name on database
		req.body.profileImg = filename;
	}
	next();
});

exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/admin
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/admin
exports.createUser = factory.createOne(User);
// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const document = await User.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			slug: slugify(req.body.name),
			email: req.body.email,
			profileImg: req.body.profileImg,
			phone: req.body.phone,
		},
		{ new: true }
	);
	if (!document) {
		return new ApiError(`There isn't document for this ${req.params.id}`, 404);
	}
	res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
	const document = await User.findByIdAndUpdate(
		req.params.id,
		{
			password: await bcrypt.hash(req.body.password, 12),
			changePasswordAt: Date.now(),
		},
		{ new: true }
	);

	if (!document) {
		return new ApiError(`no document found with this id ${req.params.id}`, 404);
	}
	res.status(200).json({ data: document });
});
// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/admin
exports.deleteUser = factory.deleteOne(User);
