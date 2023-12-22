const express = require("express");
const {
	uploadProductImage,
	resizeImage,
	getProduct,
	getProducts,
	createProduct,
	deleteProduct,
	updateProduct,
} = require("../services/productService");
const reviewRoute = require("./reviewRoute");
const {
	getProductValidator,
	createProductValidator,
	deleteProductValidator,
	updateProductValidator,
} = require("../utils/validator/productValidator");

const AuthService = require("../services/authService");

const router = express.Router();

// Nested route
// GET /api/v1/products/:productId/reviews
router.use("/:productId/reviews", reviewRoute);

router
	.route("/")
	.get(getProducts)
	.post(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager"),
		uploadProductImage,
		resizeImage,
		createProductValidator,
		createProduct
	);

router
	.route("/:id")
	.get(getProductValidator, getProduct)
	.put(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager"),
		updateProductValidator,
		updateProduct
	)
	.delete(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		deleteProductValidator,
		deleteProduct
	);



module.exports = router;