const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlerFactory");
const Category = require("../models/CategoryModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddlewares");
// 1-using diskStorage
// const multerStorage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, "uploads/categories");
// 	},
// 	filename: function (req, file, cb) {
//         const ext = file.mimetype.split("/")[1];
//         cb(null,filename)
// 	},
// });
// 2- using memoryStorage()
// const multerStorage = multer.memoryStorage({});
// const filterImage = function (req, file, cb) {
// 	if (file.mimetype.startsWith("image")) {
// 		cb(null, true);
// 	} else {
// 		cb(new ApiError(`Accept only image file`, 400), false);
// 	}
// };
// const upload = multer({ storage: multerStorage, fileFilter: filterImage });

// upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

// Processing the image
exports.resizeImage = asyncHandler(async (req, res, next) => {
	const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
	if (req.file) {
		await sharp(req.file.buffer)
			.resize(600, 600)
			.toFormat("jpeg")
			.jpeg({ quality: 90 })
			.toFile(`uploads/categories/${filename}`);
		// save image as name on database
		req.body.image = filename;
	}
	next();
});
// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
