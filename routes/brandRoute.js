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

const router = express.Router();
router
	.route("/")
	.get(getBrands)
	.post(uploadBrandImage, resizeImage, createBrandValidator, createBrand);
router
	.route("/:id")
	.get(getBrandValidator, getBrand)
	.put(uploadBrandImage, resizeImage, updateBrandValidator, updateBrand)
	.delete(deleteBrandValidator, deleteBrand);

module.exports = router;
