const express = require("express");
const {
	getBrandValidator,
	createBrandValidator,
	deleteBrandValidator,
	updateBrandValidator,
} = require("../utils/validator/brandValidator");

const {
	uploadBrandImage,
	resizeImage,
	getBrands,
	getBrand,
	createBrand,
	updateBrand,
	deleteBrand,
} = require("../services/brandService");

const AuthService = require("../services/authService");

const router = express.Router();
router
	.route("/")
	.get(getBrands)
	.post(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager"),
		uploadBrandImage,
		resizeImage,
		createBrandValidator,
		createBrand
	);
router
	.route("/:id")
	.get(getBrandValidator, getBrand)
	.put(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager"),
		uploadBrandImage,
		resizeImage,
		updateBrandValidator,
		updateBrand
	)
	.delete(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		deleteBrandValidator,
		deleteBrand
	);

module.exports = router;
