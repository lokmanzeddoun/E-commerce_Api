const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");

exports.getSubCategoryValidator = [
	check("id")
		.notEmpty()
		.withMessage("No Id Found")
		.isMongoId()
		.withMessage("Invalid SubCategory Id"),
	validatorMiddleware,
];
exports.createSubCategoryValidator = [
	check("name")
		.notEmpty()
		.withMessage("The subCategory must not be empty")
		.isLength({ min: 2 })
		.withMessage("Too short Subcategory name")
		.isLength({ max: 32 })
		.withMessage("Too long SubCategory name")
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	check("category")
		.notEmpty()
		.withMessage("category required")
		.isMongoId()
		.withMessage("Invalid Id for Category"),

	validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
	check("id")
		.notEmpty()
		.withMessage("No Id Found")
		.isMongoId()
		.withMessage("Invalid subCategory Id Format"),
	validatorMiddleware,
];

exports.updateSubCategoryValidator = [
	check("id")
		.notEmpty()
		.withMessage("No Id Found")
		.isMongoId()
		.withMessage("Invalid subCategory Id Format"),
	body("name").custom((val, { req }) => {
		req.body.slug = slugify(val);
		return true;
	}),
	validatorMiddleware,
];
