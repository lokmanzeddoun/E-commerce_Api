/* eslint-disable node/no-unsupported-features/es-syntax */

const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const multer = require("multer");
const ApiError = require("../utils/ApiError");
const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const { uploadMixImage } = require("../middlewares/uploadImageMiddlewares");

exports.uploadProductImage = uploadMixImage([
	{ name: "imageCover", maxCount: 1 },
	{ name: "image", maxCount: 5 },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
	// 1-image processing for imageCover
	if (req.files.imageCover) {
		const filename = `product-${uuidv4()}-${Date.now()}-Cover.jpeg`;
		await sharp(req.files.imageCover[0].buffer)
			.resize(2000, 1333)
			.toFormat("jpeg")
			.jpeg({ quality: 90 })
			.toFile(`uploads/products/cover-image/${filename}`);
		req.body.imageCover = filename;
	}
	// 2-image processing for image
	if (req.files.image) {
		req.body.image = [];
		const images = req.files.image;
		await Promise.all(
			images.map(async (img, index) => {
				const imgName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
				await sharp(img.buffer)
					.resize(200, 100)
					.toFormat("jpeg")
					.jpeg({ quality: 99 })
					.toFile(`uploads/products/images/${imgName}`);
				req.body.image.push(imgName);
			})
		);
	}
	next();
	// const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

	// await sharp(req.file.buffer)
	// 	.resize(600, 600)
	// 	.toFormat("jpeg")
	// 	.jpeg({ quality: 90 })`
	// 	.toFile(`uploads/products/${filename}`);
	// // save image as name on database
	// req.body.image = filename;
	// next();
});

// @desc    Get list of Products
// @route   GET /api/v1/products
// @access  Public

exports.getProducts = factory.getAll(Product, "Products");

// @desc    Get specific Product by id
// @route   GET /api/v1/Products/:id
// @access  Public
exports.getProduct = factory.getOne(Product);

// @desc    Create Product
// @route   POST  /api/v1/Products
// @access  Private
exports.createProduct = factory.createOne(Product);

// @desc    Update specific Product
// @route   PUT /api/v1/Products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific Product
// @route   DELETE /api/v1/Products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);
