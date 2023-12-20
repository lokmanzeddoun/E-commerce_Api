
const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");



exports.getReviews = factory.getAll(Review);

// @desc    Get specific Review by id
// @route   GET /api/v1/Reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @desc    Create Review
// @route   POST  /api/v1/Reviews
// @access  Private/Protect/User
exports.createReview = factory.createOne(Review);
// @desc    Update specific Review
// @route   PUT /api/v1/Reviews/:id
// @access  Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific Review
// @route   DELETE /api/v1/Reviews/:id
// @access  Private/Protect/Admin-Manager-User
exports.deleteReview = factory.deleteOne(Review);
