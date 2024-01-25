// Core module
const path = require("path");
// Third-party Module
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const ApiError = require("./utils/ApiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const cors = require("cors");
const compression = require("compression");
const {webhookCheckout} = require("./services/orderService");

// Routes
const mountRoutes = require("./routes");
// Set up configuration
dotenv.config({ path: "config.env" });

// Connect with db
dbConnection();

// express app
const app = express();

// Middlewares
// Enable different domain to access your application
app.use(cors());
app.options("*", cors());
// compress all response
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

app.post('/webhook-checkout', express.raw({type: 'application/json'},webhookCheckout))

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
	console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

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
