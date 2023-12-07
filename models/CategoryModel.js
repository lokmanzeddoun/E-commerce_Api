const mongoose = require("mongoose");
// 1- Create Schema
const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Category required"],
			unique: [true, "Category must be unique"],
			minlength: [3, "Too short category name"],
			maxlength: [32, "Too long category name"],
		},
		// A and B => shop.com/a-and-b
		slug: {
			type: String,
			lowercase: true,
		},
		image: String,
	},
	{ timestamps: true }
);
// The function that change the image field from text to url
const setImageUrl = (doc) => {
	if (doc.image) {
		const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`
		doc.image = imageUrl
	}
}
// Mongoose Middleware for assigning image the imageUrl

// 1- getAll getOne updateOne
categorySchema.post('init', (doc) => {
	setImageUrl(doc)
})
categorySchema.post('save', (doc) => {
	setImageUrl(doc)
})

// 2- Create model

module.exports = mongoose.model("Category", categorySchema);
