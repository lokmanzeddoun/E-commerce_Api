const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		const { id } = req.params;
		if (Model.collection.collectionName === "users") {
			const document = await Model.findByIdAndUpdate(
				{
					_id: id,
				},
				{ active: false },
				{ new: true }
			);
			res.status(200).json({ data: document });
			return;
		}
		const document = await Model.findByIdAndDelete(id);
		if (!document) {
			return next(new ApiError(`No document for this id ${id}`, 404));
		}
		res.status(204).send();
	});

exports.updateOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!document) {
			return next(
				new ApiError(`No Document Found For This Id ${req.params.id}`)
			);
		}
		res.status(200).json({ data: document });
	});

exports.createOne = (Model) =>
	asyncHandler(async (req, res) => {
		const document = await Model.create(req.body);
		res.status(201).json({ data: document });
	});

exports.getOne = (Model, populateOpts) =>
	asyncHandler(async (req, res, next) => {
		// 1) Build the query
		const { id } = req.params;
		let query =  Model.findById(id);
		if (populateOpts) {
			query = query.populate(populateOpts);
		}
		// 2) Execute the query
		const document = await query;
		if (!document) {
			next(new ApiError(`No Category Found For This Id ${id}`, 404));
		}
		res.status(200).json({ data: document });
	});

exports.getAll = (Model, modelName = "") =>
	asyncHandler(async (req, res) => {
		let filter = {};
		if (req.filterObj) {
			filter = req.filterObj;
		}

		const count = await Model.countDocuments();
		const docApi = new ApiFeatures(Model.find(filter), req.query)
			.paginate(count)
			.filter()
			.sort()
			.search(modelName)
			.limitFields();

		const { mongooseQuery, paginationResult } = docApi;
		const document = await mongooseQuery;

		res
			.status(200)
			.json({ results: document.length, paginationResult, data: document });
	});
