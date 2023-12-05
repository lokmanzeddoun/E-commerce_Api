const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");
// 1=>rules
exports.getCategoryValidator = [
	check("id").isMongoId().withMessage("Invalid category Id"),
	validatorMiddleware,
];

exports.createCategoryValidator = [
	check("name")
		.notEmpty()
		.withMessage("Category required")
		.isLength({ min: 3 })
		.withMessage("Too short Category")
		.isLength({ max: 32 })
		.withMessage("Too long category name")
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	validatorMiddleware,
];
exports.deleteCategoryValidator = [
	check("id").isMongoId().withMessage("Invalid category Id Format"),

	validatorMiddleware,
];

exports.updateCategoryValidator = [
	check("id").isMongoId().withMessage("Invalid category Id Format"),
	body("name").custom((val, { req }) => {
		req.body.slug = slugify(val);
		return true;
	}),
	validatorMiddleware,
];
