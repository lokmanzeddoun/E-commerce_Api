const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

// @desc Add Product to ShoppingCart
// @route POST /api/v1/cart
// @access Private/user
// calculate the total price

const calculateTotalPrice = (cart) => {
	let totalPrice = 0;
	cart.cartItems.forEach((item) => {
		totalPrice += item.price * item.quantity;
	});
	cart.totalPriceAfterDiscount = undefined;
	cart.totalPrice = totalPrice;
};
exports.addProductToCart = asyncHandler(async (req, res, next) => {
	const { productId, color } = req.body;
	const product = await Product.findById(productId);
	// 1) Get Card for logged User
	let cart = await Cart.findOne({ user: req.user._id });
	if (!cart) {
		// create cart for logged User
		cart = await Cart.create({
			user: req.user._id,
			cartItems: {
				product: productId,
				color,
				price: product.price,
			},
		});
	} else {
		// if product exist update the quantity
		const productIndex = cart.cartItems.findIndex(
			(item) => item.product.toString() === productId && item.color === color
		);
		if (productIndex > -1) {
			const cartItem = cart.cartItems[productIndex];
			cartItem.quantity += 1;
			cart.cartItems[productIndex] = cartItem;
		}
		// if product not exist push the product to the product array
		else {
			cart.cartItems.push({
				product: productId,
				color,
				price: product.price,
			});
		}
	}
	calculateTotalPrice(cart);
	await cart.save();
	res.status(200).json({
		status: "Success",
		message: "added new product to shopping cart",
		data: cart,
	});
});

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOne({ user: req.user._id });
	if (!cart) {
		return next(new ApiError(`there no cart on this user `, 404));
	}
	res.status(200).json({ nbrOfProduct: cart.cartItems.length, data: cart });
});

exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOneAndUpdate(
		{ user: req.user._id },
		{
			$pull: {
				cartItems: { _id: req.params.itemId },
			},
		},
		{ new: true }
	);
	calculateTotalPrice(cart);
	await cart.save();
	res.status(200).json({ nbrOfProduct: cart.cartItems.length, data: cart });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOneAndDelete({ user: req.user._id });
	if (!cart) {
		return next(new ApiError("There no Card for this user"), 404);
	}
	res.status(204).send();
});

exports.updateQuantity = asyncHandler(async (req, res, next) => {
	const { quantity } = req.body;
	const cart = await Cart.findOne({ user: req.user._id });

	if (!cart) {
		return next(new ApiError(`There is no cart for this id `, 404));
	}

	const itemIndex = cart.cartItems.findIndex(
		(item) => item._id.toString() === req.params.itemId
	);
	if (itemIndex > -1) {
		cart.cartItems[itemIndex].quantity = quantity;
	} else {
		return next(
			new ApiError(`there no item for this id ${req.params.itemId}`, 404)
		);
	}
	calculateTotalPrice(cart);
	await cart.save();
	res.status(200).json({
		status: "Success",
		nbrOfProduct: cart.cartItems.length,
		data: cart,
	});
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
	// 1/ get the coupon based on the coupon name
	const coupon = await Coupon.findOne({
		value: req.body.coupon,
		expire: { $gt: Date.now() },
	});
	if (!coupon) {
		return next(
			new ApiError(
				`This coupon ${req.body.coupon} Has been expired Or Invalid`,
				404
			)
		);
	}
	// 2) get the user cart
	const cart = await Cart.findOne({ user: req.user._id });
	const { totalPrice } = cart;

	// 3) calculate the price after discount
	cart.totalPriceAfterDiscount = (
		totalPrice -
		(totalPrice * coupon.discount) / 100
	).toFixed(2);

	await cart.save();

	res.status(200).json({
		status: "Success",
		nbrOfProduct: cart.cartItems.length,
		data: cart,
	});
});
