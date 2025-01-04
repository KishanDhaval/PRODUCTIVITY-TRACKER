const Report = require("../models/Report");

// Get productivity report
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne(); // Assuming one report per user
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Generate a new report (dummy logic for example)
exports.generateReport = async (req, res, next) => {
  try {
    const productiveTime = Math.floor(Math.random() * 300); // Dummy data
    const distractingTime = Math.floor(Math.random() * 100); // Dummy data

    const productivityScore =
      (productiveTime / (productiveTime + distractingTime)) * 100;

    const report = new Report({
      productiveTime,
      distractingTime,
      productivityScore: Math.round(productivityScore),
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};
