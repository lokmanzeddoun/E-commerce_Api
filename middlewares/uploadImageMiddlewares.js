const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerOption = () => {
	const multerStorage = multer.memoryStorage();
	const filterImage = function (req, file, cb) {
		if (file.mimetype.startsWith("image")) {
			cb(null, true);
		} else {
			cb(new ApiError(`Only Image are possible `, 400), false);
		}
	};
	const upload = multer({ storage: multerStorage, fileFilter: filterImage });
	return upload;
};

exports.uploadSingleImage = (fieldName) => multerOption().single(fieldName);

exports.uploadMixImage = (arr) => multerOption().fields(arr);
