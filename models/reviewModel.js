const Product = require("./productModel");
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
		// parent reference (one to many)
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

reviewSchema.statics.calcAverageRatingAndQuantity = async function (productId) {
	const result = await this.aggregate([
		// 1- get all the reviews that belong to a product
		{ $match: { product: productId } },
		// 2- grouping the reviews based on the product and calculate the average rating and quantity
		{
			$group: {
				_id: "product", // assuming you want to group by the "product" field
				avgRatings: { $avg: "$ratings" },
				totalQuantity: { $sum: 1 },
			},
		},
	]);
	if (result.length > 0) {
		await Product.findByIdAndUpdate(productId, {
			ratingsAverage: result[0].avgRatings,
			ratingsQuantity: result[0].totalQuantity,
		});
	} else {
		await Product.findByIdAndUpdate(productId, {
			ratingsAverage: 0,
			ratingsQuantity: 0,
		});
	}
};
reviewSchema.post("remove", async function () {
	console.log("Removing ... is Under the process");
	await this.constructor.calcAverageRatingAndQuantity(this.product);
});
reviewSchema.post("save", async function () {
	await this.constructor.calcAverageRatingAndQuantity(this.product);
});
module.exports = mongoose.model("Review", reviewSchema);


// There is two different way to make relation between models there is :
// 1-Multiple collections and 2-Embedded collections
