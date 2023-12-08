const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const Brand = require("../models/brandModel");
const factory = require("./handlerFactory");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddlewares")


exports.uploadBrandImage = uploadSingleImage("image");

// Processing the image
exports.resizeImage = asyncHandler(async (req, res, next) => {
	const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
	await sharp(req.file.buffer)
		.resize(600, 600)
		.toFormat("jpeg")
		.jpeg({ quality: 90 })
		.toFile(`uploads/brands/${filename}`);
	// save image as name on database
	req.body.image = filename;
	next();
});

exports.getBrands = factory.getAll(Brand);

// @desc    Get specific Brand by id
// @route   GET /api/v1/Brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand);

// @desc    Create Brand
// @route   POST  /api/v1/Brands
// @access  Private/Admin-Manager
exports.createBrand = factory.createOne(Brand);
// @desc    Update specific Brand
// @route   PUT /api/v1/Brands/:id
// @access  Private/Admin-Manager
exports.updateBrand = factory.updateOne(Brand);

// @desc    Delete specific Brand
// @route   DELETE /api/v1/Brands/:id
// @access  Private/Admin
exports.deleteBrand = factory.deleteOne(Brand);
