// Core module
const path = require("path");
// Third-party Module
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const ApiError = require("./utils/ApiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

// Route
const categoryRoute = require("./routes/CategoryRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const BrandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authroute");
const reviewRoute = require("./routes/reviewRoute");
// Set up configuration
dotenv.config({ path: "config.env" });

// Connect with db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
	console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subCategoryRoute);
app.use("/api/v1/brand", BrandRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/review", reviewRoute);

app.all("*", (req, res, next) => {
	next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
	console.log(`App running running on port ${PORT}`);
});
// Event => list =>callback(err)
// Handle rejection outside express
process.on("unhandledRejection", (err) => {
	console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
	// just in case of the current request
	server.close(() => {
		console.error(`Shutting down....`);
		process.exit(1);
	});
});
