const Review = require("../../models/reviewModel");
const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");
// 1=>rules
exports.getReviewValidator = [
	check("id").isMongoId().withMessage("Invalid Review Id"),
	validatorMiddleware,
];

exports.createReviewValidator = [
	check("title").optional(),
	check("ratings")
		.notEmpty()
		.withMessage("Review must have a rating")
		.isFloat({ min: 1, max: 5 })
		.withMessage("rating must be between 1  and 5"),
	check("user").isMongoId().withMessage("Invalid User Id"),
	check("product")
		.isMongoId()
		.withMessage("Invalid Product Id")
		.custom((val, { req }) =>
			// check if logged user create a review before

			Review.findOne({ user: req.body.user, product: req.body.product }).then(
				(review) => {
					if (review) {
						return Promise.reject(
							new Error("You have already created a review on this product")
						);
					}
				}
			)
		),
	validatorMiddleware,
];
exports.deleteReviewValidator = [
	check("id")
		.isMongoId()
		.withMessage("Invalid Review Id Format")
		.custom((val, { req }) => {
			if (req.user.role === "user") {
				return Review.findById(val).then((review) => {
					if (!review) {
						return Promise.reject(
							new Error(`There is no review with this Id : ${val}`)
						);
					}
					if (review.user._id.toString() !== req.user._id.toString()) {
						return Promise.reject(new Error(`You can't perform this action`));
					}
				})
			
			} 
				return Promise.resolve(true)
			
		}),
			

	validatorMiddleware,
];

exports.updateReviewValidator = [
	check("id")
		.isMongoId()
		.withMessage("Invalid Review Id Format")
		.custom((val, { req }) =>
			Review.findById(val).then((review) => {
				if (!review) {
					return Promise.reject(
						new Error(`There is no review with this Id : ${val}`)
					);
				}
				if (review.user._id.toString() !== req.user._id.toString()) {
					return Promise.reject(new Error(`You can't perform this action`))
				}
			})
		),
	validatorMiddleware,
];
