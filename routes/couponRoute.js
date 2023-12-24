const express = require("express");

const {
	getCoupon,
	getCoupons,
	deleteCoupon,
	updateCoupon,
	createCoupon,
} = require("../services/couponService");

const AuthService = require("../services/authService");

const router = express.Router();
router.use(AuthService.protect, AuthService.allowedTo("admin", "manager"));
router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
