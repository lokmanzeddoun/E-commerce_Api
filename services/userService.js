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

const createToken = require("../utils/createToken");

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
		return next(new ApiError(`There isn't document for this ${req.params.id}`), 404);
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

// @desc Get logged user data
// @route GET api/v1/users/getMe
// Access Private/protect

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
	req.params.id = req.user._id;
	next();
});

// @desc update logged user password
// @route GET api/v1/users/updateMyPassword
// Access Private/protect

exports.updateMyPassword = asyncHandler(async (req, res, next) => {
	// 1) update the password based on the payload (req.user._id)
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{
			password: await bcrypt.hash(req.body.password, 12),
			changePasswordAt: Date.now(),
		},
		{ new: true }
	);

	const token = createToken(req.user._id);

	res.status(200).json({ data: user, token });
});

// @desc update logged user data (without password , role)
// @route PUT api/v1/users/updateMyData
// Access Private/protect

exports.updateMyData = asyncHandler(async (req, res, next) => {
	const updateUser = await User.findByIdAndUpdate(
		req.user._id,
		{ name: req.body.name, email: req.body.email, phone: req.body.phone },
		{ new: true }
	);

	res.status(200).json({ data: updateUser });
});

// @desc deactivate logged user data 
// @route DELETE api/v1/users/deactivate
// Access Private/protect

exports.deactivate = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    { new: true }
  );

  res.status(204).json({ status:"success" });
});
