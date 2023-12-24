const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
	{
		value: {
			type: "string",
			trim: true,
			required: [true, "coupon value is required"],
			unique: true,
		},
		expire: {
			type: Date,
			required: [true, "coupon value must have an expiration date"],
		},
		discount: {
			type: Number,
			required: [true, "coupon value discount is required"],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
