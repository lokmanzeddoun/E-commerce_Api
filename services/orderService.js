const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const cartModel = require("../models/cartModel");

// @desc create cash order
// @route POST /api/v1/orders/cartId
// @access Private/User

exports.createCashHandler = asyncHandler(async (req, res, next) => {
	// 1) get the card depend on card Id
	const cart = await cartModel.findById(req.params.cartId);
	if (!cart)
		return next(
			new ApiError(`There is no cart with this id ${req.params.cartId}`),
			404
		);
	// 2) Get the order price  depend on the card price ("Check if the coupon is applied")
	const orderPrice = cart.totalPriceAfterDiscount
		? cart.totalPriceAfterDiscount
		: cart.totalPrice;
	// 3) Create the order with the default PaymentMethod type (cash method)
	const order = await Order.create({
		user: req.user._id,
		cartItems: cart.cartItems,
		totalOrderPrice: orderPrice,
	});
	// 4) After Creating the order , decrement product quantity,increment product sold
	// bulkWrite : You can send multiple operation(like : insertOne , updateOne,deleteOne ... )

	if (order) {
		const bulkOptions = cart.cartItems.map((item) => ({
			updateOne: {
				filter: { _id: item.product },
				update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
			},
		}));
		await Product.bulkWrite(bulkOptions, {});
		// 5) Clear the cart depend on cartIdn
		await cart.findByIdAndDelete(req.params.cartId);
	}
	res.status(201).json({ status: "Success", data: order });
});
// @desc get All The Orders
// @route GET /api/v1/orders
// @access Private/User-admin-manager
exports.getAllOrders = factory.getAll(Order);
// @desc get specific order
// @route GET /api/v1/orders/:id
// @access Private/User-admin-manager
exports.getSpecificOrder = factory.getOne(Order);

exports.filterOrderedForLoggedUser = asyncHandler(async (req, res, next) => {
	if (req.user.role === "user") {
		req.filterObj = { user: req.user._id };
	}
});

// @desc update status order paid
// @route PUT /api/v1/orders/:id/pay
// @access Private/admin

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) {
		return next(
			new ApiError(`There is no Order With This Id ${req.params.id}`, 404)
		);
	}
	// update the order to paid
	order.isPaid = true;
	order.paidAt = Date.now();

	const updateOrder = await order.save();

	res.status(200).json({ status: "success", data: updateOrder });
});

// @desc update status order Delivered
// @route PUT /api/v1/orders/:id/deliver
// @access Private/admin
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) {
		return next(
			new ApiError(`There is no Order With This Id ${req.params.id}`, 404)
		);
	}
	// update the order to Delivered
	order.isDelivered = true;
	order.DeliveredAt = Date.now();

	const updateOrder = await order.save();

	res.status(200).json({ status: "success", data: updateOrder });
});
