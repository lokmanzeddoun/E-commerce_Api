const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "The review must contain a title"],
		},
		ratings: {
			type: Number,
			required: [true, "The review must contain a rating"],
			min: [1, "Min review is 1.0"],
			max: [5, "Max review is 5.0"],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "the review must belong to a user "],
		},
		product: {
			type: mongoose.Schema.ObjectId,
			ref: "Product",
			required: [true, "the review must belong to a product"],
		},
	},
	{ timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
	this.populate({ path: "user", select: "name" });
	next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

// There is two different way to make relation between models there is :
// 1-Multiple collections and 2-Embedded collections
