const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

// nested route
// GET /products/:productId/reviews
exports.createFilterObject = (req, res, next) => {
	let filterObject = {};
	if (req.params.productId) {
		filterObject = { product: req.params.productId };
	}
	req.filterObject = filterObject;
	next();
};


exports.getReviews = factory.getAll(Review);

// @desc    Get specific Review by id
// @route   GET /api/v1/Reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);


exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
}

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
