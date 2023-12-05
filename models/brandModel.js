const mongoose = require("mongoose");

const brandSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "brand must be required"],
			unique: [true, "brand must be unique"],
			minlength: [2, "Too short Brand"],
			maxlength: [30, "Too long Brand"],
		},
		slug: {
			type: String,
			lowercase: true,
		},
		image: String,
	},
	{ timestamps: true }
);

const setImageUrl = (doc) => {
	if (doc.image) {
		const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
		doc.image = imageUrl;
	}
};

// Mongoose Middleware for assigning image the imageUrl

// 1- getAll getOne updateOne
brandSchema.post("init", (doc) => {
	setImageUrl(doc);
});
brandSchema.post("save", (doc) => {
	setImageUrl(doc);
});

module.exports = mongoose.model("Brand", brandSchema);
