const Report = require("../models/report");
const { body, param, validationResult } = require("express-validator");
const passport = require("passport");
const asyncHandler = require("express-async-handler");

// Create a new report
exports.createReport = [
  passport.authenticate("jwt", { session: false }),
  body("reported").notEmpty().withMessage("Reported ID is required"),
  body("reportedType").notEmpty().withMessage("Reported Type is required"),
  body("desc")
    .notEmpty()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reported, reportedType, desc } = req.body;
    const reporter = req.user._id; // Extract reporter ID from authenticated user

    const report = new Report({ reporter, reported, reportedType, desc });
    await report.save();

    res.status(201).json({ message: "Report created successfully.", report });
  }),
];

// Get all reports
exports.getAllReports = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    const reports = await Report.find()
      .populate("reporter")
      .populate("reported");

    if (!reports.length) {
      return res.status(200).json({ message: "No reports found." });
    }

    res.status(200).json({ reports });
  }),
];

// Get a single report by ID
exports.getReportById = [
  passport.authenticate("jwt", { session: false }),
  param("id").isMongoId().withMessage("Invalid report ID format"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const report = await Report.findById(id)
      .populate("reporter")
      .populate("reported");

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    res.status(200).json({ report });
  }),
];

// Update a report by ID
exports.updateReport = [
  passport.authenticate("jwt", { session: false }),
  param("id").isMongoId().withMessage("Invalid report ID format"),
  body("desc")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { desc } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { desc },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    res.status(200).json({ message: "Report updated successfully.", report });
  }),
];

// Delete a report by ID
exports.deleteReport = [
  passport.authenticate("jwt", { session: false }),
  param("id").isMongoId().withMessage("Invalid report ID format"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    res.status(200).json({ message: "Report deleted successfully." });
  }),
];