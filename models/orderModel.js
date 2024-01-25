const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: [true, "must be a user for an order"],
		},
		cardItems: [
			{
				product: {
					type: mongoose.Types.ObjectId,
					ref: "Product",
					required: [true, "The item must be a product"],
				},
				totalPrice: Number,
				quantity: Number,
				color: String,
				totalPriceAfterDiscount: Number,
			},
		],
		taxPrice: {
			type: Number,
			default: 0,
		},
		shippingPrice: {
			type: Number,
			default: 0,
		},
		totalOrderPrice: {
			type: Number,
		},
		methodPayment: {
			type: String,
			enum: ["cash", "card"],
			default: "cash",
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		paidAt: Date,

		isDelivered: {
			type: Boolean,
			default: false,
		},
		deliveredAt: Date,
	},
	{ timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
	this.populate({
		path: "user",
		select: "name profileImg email phone",
	}).populate({ path: "cardItems.product", select: "title imageCover" });
	next();
});
module.exports = mongoose.model("Order", orderSchema);
