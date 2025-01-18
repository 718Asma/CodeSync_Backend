const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Route to create a new report
router.post("/create", reportController.createReport);

// Route to get all reports
router.get("/all", reportController.getAllReports);

// Route to get a report by ID
router.get("/id/:reportId", reportController.getReportById);

// Route to update a report by ID
router.put("/update/:reportId", reportController.updateReport);

// Route to delete a report by ID
router.delete("/delete/:reportId", reportController.deleteReport);

module.exports = router;