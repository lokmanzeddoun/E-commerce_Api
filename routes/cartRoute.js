const express = require("express");

const {
	addProductToCart,
	getLoggedUserCart,
	removeProductFromCart,
	clearCart,
	updateQuantity,
	applyCoupon
} = require("../services/cartService");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router
	.route("/")
	.post(addProductToCart)
	.get(getLoggedUserCart)
	.delete(clearCart);
	router.put("/applyCoupon",applyCoupon)
router.route("/:itemId").delete(removeProductFromCart).put(updateQuantity);



module.exports = router;
