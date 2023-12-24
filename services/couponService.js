
const coupon = require("../models/couponModel");
const factory = require("./handlerFactory");

// @desc    Get all coupon
// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager

exports.getCoupons = factory.getAll(coupon);

// @desc    Get specific Coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = factory.getOne(coupon);

// @desc    Create Coupon
// @route   POST  /api/v1/coupons
// @access  Private/Admin-Manager
exports.createCoupon = factory.createOne(coupon);
// @desc    Update specific Coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = factory.updateOne(coupon);

// @desc    Delete specific Coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = factory.deleteOne(coupon);
