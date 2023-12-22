const express = require("express");
const {
	getReviewValidator,
	createReviewValidator,
	deleteReviewValidator,
	updateReviewValidator,
} = require("../utils/validator/reviewValidator");

const {
	createFilterObject,
	setProductIdAndUserIdToBody,
	createReview,
	getReview,
	getReviews,
	updateReview,
	deleteReview,
} = require("../services/reviewService");

const AuthService = require("../services/authService");

const router = express.Router({ mergeParams: true });
router
	.route("/")
	.get(createFilterObject, 	getReviews)
	.post(
		AuthService.protect,
		AuthService.allowedTo("user"),
		setProductIdAndUserIdToBody,
		createReviewValidator,
		createReview
	);
router
	.route("/:id")
	.get(getReviewValidator, getReview)
	.put(
		AuthService.protect,
		AuthService.allowedTo("user"),
		updateReviewValidator,
		updateReview
	)
	.delete(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager", "user"),
		deleteReviewValidator,
		deleteReview
	);

module.exports = router;
