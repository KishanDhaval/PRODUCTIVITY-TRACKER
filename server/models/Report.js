const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  site: { type: String, required: true }, // Website name
  productivityScore: { type: Number, required: true }, // Score for productivity
  productiveTime: { type: Number, required: true }, // Productive time in minutes
  distractingTime: { type: Number, required: true }, // Distracting time in minutes
  date: { type: Date, default: Date.now }, // Date of the record
});

module.exports = mongoose.model("Report", reportSchema);
