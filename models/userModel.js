const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "name required"],
			trim: true,
		},
		slug: {
			type: String,
			lowercase: true,
		},
		email: {
			type: String,
			required: [true, "email is required"],
			unique: true,
			lowercase: true,
		},
		profileImg: String,
		phone: String,
		password: {
			type: String,
			required: [true, "the password is required"],
			minlength: [6, "Too short password"],
		},
		changePasswordAt: Date,
		resetPasswordCode: String,
		resetPasswordExpire: Date,
		passwordResetVerified: Boolean,
		role: {
			type: String,
			enum: ["user", "manager", "admin"],
			default: "user",
		},
		// child reference : (one to many)
		wishlist: [
			{
				type: mongoose.Schema.ObjectId,
				ref: "Product",
			},
		],
		active: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const setImageUrl = (doc) => {
	if (doc.profileImg) {
		const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
		doc.profileImg = imageUrl;
	}
};
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	// hashing the password
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.post("init", (doc) => {
	setImageUrl(doc);
});
userSchema.post("save", (doc) => {
	setImageUrl(doc);
});

module.exports = mongoose.model("User", userSchema);
