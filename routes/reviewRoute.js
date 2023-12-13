const express = require("express");
const {
	getReviewValidator,
	createReviewValidator,
	deleteReviewValidator,
	updateReviewValidator,
} = require("../utils/validator/reviewValidator");

const {
	createReview,
	getReview,
	getReviews,
	updateReview,
	deleteReview,
} = require("../services/reviewService");

const AuthService = require("../services/authService");

const router = express.Router();
router
	.route("/")
	.get(getReviews)
	.post(
		AuthService.protect,
		AuthService.allowedTo("user"),
		createReviewValidator,
		createReview
	);
router
	.route("/:id")
	.get(getReview)
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
