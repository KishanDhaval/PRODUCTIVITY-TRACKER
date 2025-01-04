const express = require("express");
const router = express.Router();
const Report = require("../models/Report"); // Import the Report model
const PDFDocument = require("pdfkit"); // Library to generate PDF reports

// Get all reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json({ success: true, reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reports." });
  }
});

// Clear all reports
router.post("/reports/clear", async (req, res) => {
  try {
    await Report.deleteMany({});
    res.json({ success: true, message: "All reports cleared." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to clear reports." });
  }
});

// Add a report
router.post("/reports", async (req, res) => {
  try {
    const { site, productivityScore, productiveTime, distractingTime } = req.body;

    const newReport = new Report({
      site,
      productivityScore,
      productiveTime,
      distractingTime,
    });

    await newReport.save();
    res.json({ success: true, message: "Report added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add report." });
  }
});


// Generate and download a report (PDF)
router.get("/reports/report", async (req, res) => {
  try {
    const reports = await Report.find();

    const doc = new PDFDocument();
    let reportData = "Site,Productivity Score,Productive Time (min),Distracting Time (min)\n";

    // Prepare data for CSV
    reports.forEach((report) => {
      reportData += `${report.site},${report.productivityScore},${report.productiveTime},${report.distractingTime}\n`;
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=time_tracking_report.pdf",
    });

    doc.text("Time Tracking Report", { align: "center" });
    doc.moveDown();

    reports.forEach((report) => {
      doc.text(
        `Site: ${report.site}, Productivity Score: ${report.productivityScore}, Productive Time: ${report.productiveTime} min, Distracting Time: ${report.distractingTime} min`
      );
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to generate report." });
  }
});

module.exports = router;
