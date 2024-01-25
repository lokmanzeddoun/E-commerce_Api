const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(
	"sk_test_51OYy8OAQ7hxCRaqz8cIFzDc1Q7mHK1Bi8Jyt6dmsqRFl0SBQdJPlFjBen0hd69Or4Y5dLoXWSAqzdWoXji2cQM6j009crv3ROL"
);
const ApiError = require("../utils/ApiError");

const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");

// @desc create cash order
// @route POST /api/v1/orders/cartId
// @access Private/User

exports.createCashHandler = asyncHandler(async (req, res, next) => {
	// 1) get the card depend on card Id
	const cart = await cartModel.findById(req.params.cartId);
	console.log(cart);
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
		cardItems: cart.cartItems,
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
		await cartModel.findByIdAndDelete(req.params.cartId);
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
	next();
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

// @desc GET checkout session from stripe and send it as response
// @route GET /api/v1/orders/checkout-session/cartId
// @access Protected/User

exports.checkOutSession = asyncHandler(async (req, res, next) => {
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
	// Create checkout session
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: "dzd",
					product_data: {
						name: req.user.name,
					},
					unit_amount: orderPrice * 100,
				},
				quantity: 1,
			},
		],
		mode: "payment",
		// customer_details: {
		// 	name:req.user.name;
		// }
		success_url: `${req.protocol}://${req.get("host")}/orders`,
		cancel_url: `${req.protocol}://${req.get("host")}/cart`,
		client_reference_id: req.params.cartId,
		customer_email: req.user.email,
		metadata: req.body.shippingAddress,
	});

	// 4) send session to response
	res.status(200).json({ status: "success", session });
});


const createCardOrder = async (session) => {
	const cartId = session.client_reference_id;
	const shippingAddress = session.metadata;
	const oderPrice = session.amount_total / 100;

	const cart = await cartModel.findById(cartId);
	const user = await userModel.findOne({ email: session.customer_email });

	// 3) Create order with default paymentMethodType card
	const order = await Order.create({
		user: user._id,
		cartItems: cart.cartItems,
		shippingAddress,
		totalOrderPrice: oderPrice,
		isPaid: true,
		paidAt: Date.now(),
		paymentMethodType: "card",
	});

	// 4) After creating order, decrement product quantity, increment product sold
	if (order) {
		const bulkOption = cart.cartItems.map((item) => ({
			updateOne: {
				filter: { _id: item.product },
				update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
			},
		}));
		await Product.bulkWrite(bulkOption, {});

		// 5) Clear cart depend on cartId
		await cartModel.findByIdAndDelete(cartId);
	}
};


// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    //  Create order
    createCardOrder(event.data.object);
		
	}


  res.status(200).json({ received: true });
})