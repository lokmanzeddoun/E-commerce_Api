const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "The title must be required"],
			trim: true,
			maxlength: [100, "Too long Title"],
			minlength: [3, "Too short Title"],
		},
		description: {
			type: String,
			required: [true, "The Title should have description"],
			maxlength: [2000, "Too long Description"],
		},
		slug: {
			type: String,
			required: true,
			lowercase: true,
		},
		quantity: {
			type: Number,
			required: [true, "The quantity should be identified"],
		},
		sold: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, "must be price for product"],
			trim: true,
			max: [2000, "Too long price for product"],
		},
		priceAfterDiscount: {
			type: Number,
		},
		color: [String],
		imageCover: {
			type: String,
			required: [true, "Must be image for the product"],
		},
		image: [String],
		category: {
			type: mongoose.Schema.ObjectId,
			ref: "Category",
			required: [true, "The product should belong to A category"],
		},
		subCategory: [
			{
				type: mongoose.Schema.ObjectId,
				ref: "SubCategory",
			},
		],
		brand: {
			type: mongoose.Schema.ObjectId,
			ref: "Brand",
		},
		ratingsAverage: {
			type: Number,
			maxlength: [5, "Rating must be below or equal 5.0"],
			minlength: [1, "Rating must be above or equal 1.0"],
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		// to enable virtual populate 
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
productSchema.pre(/^find/, function (next) {
	this.populate({
		path: "category",
		select: "name -_id",
	});
	next();
});
const setImageUrl = (doc) => {
	if (doc.imageCover) {
		const imageUrl = `${process.env.BASE_URL}/products/cover-image/${doc.imageCover}`;
		doc.imageCover = imageUrl;
	}
	if (doc.image) {
		const imageList = [];
		doc.image.forEach((element) => {
			const imageUrl = `${process.env.BASE_URL}/products/images/${element}`;
			imageList.push(imageUrl);
		});
		doc.image = imageList;
	}
};

productSchema.virtual("reviews", {
	ref: "Review",
	foreignField: "product",
	localField: "_id",
});

productSchema.post("init", (doc) => {
	setImageUrl(doc);
});
productSchema.post("save", (doc) => {
	setImageUrl(doc);
});
module.exports = mongoose.model("Product", productSchema);
