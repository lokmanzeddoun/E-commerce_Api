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

const {
	getProductValidator,
	createProductValidator,
	deleteProductValidator,
	updateProductValidator,
} = require("../utils/validator/productValidator");

const router = express.Router();

router.route("/").get(getProducts).post(uploadProductImage,resizeImage,createProductValidator, createProduct);

router
	.route("/:id")
	.get(getProductValidator, getProduct)
	.put(updateProductValidator, updateProduct)
	.delete(deleteProductValidator, deleteProduct);



module.exports = router;