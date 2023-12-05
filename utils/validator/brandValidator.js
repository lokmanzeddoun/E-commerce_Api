const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");
// 1=>rules
exports.getBrandValidator = [
	check("id").isMongoId().withMessage("Invalid Brand Id"),
	validatorMiddleware,
];

exports.createBrandValidator = [
	check("name")
		.notEmpty()
		.withMessage("Brand required")
		.isLength({ min: 2 })
		.withMessage("Too short Brand")
		.isLength({ max: 32 })
		.withMessage("Too long Brand name")
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	validatorMiddleware,
];
exports.deleteBrandValidator = [
	check("id").isMongoId().withMessage("Invalid Brand Id Format"),

	validatorMiddleware,
];

exports.updateBrandValidator = [
	check("id").isMongoId().withMessage("Invalid Brand Id Format"),
	body("name").custom((val, { req }) => {
		req.body.slug = slugify(val);
		return true;
	}),
	validatorMiddleware,
];
