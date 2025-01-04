const mongoose = require('mongoose');

const timeTrackingSchema = new mongoose.Schema({
  site: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('TimeTracking', timeTrackingSchema);
