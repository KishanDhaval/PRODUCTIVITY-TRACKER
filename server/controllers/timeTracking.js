const TimeTracking = require("../models/TimeTracking");

// Get time tracking data
exports.getTimeTracking = async (req, res, next) => {
  try {
    const data = await TimeTracking.find();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Add or update time spent on a website
exports.addTimeSpent = async (req, res, next) => {
  try {
    const timeSpentData = req.body;
    console.log('Received time spent data:', JSON.stringify(timeSpentData, null, 2)); // Detailed logging
    
    if (!Array.isArray(timeSpentData) || timeSpentData.length === 0) {
      return res.status(400).json({ error: 'Time spent data is required and should be an array.' });
    }

    for (const { site, duration } of timeSpentData) {
      if (!site || !duration) {
        return res.status(400).json({ error: 'Site and duration are required for each entry.' });
      }

      let entry = await TimeTracking.findOne({ site });

      if (entry) {
        entry.duration += duration;
      } else {
        entry = new TimeTracking({ site, duration });
      }

      await entry.save();
    }

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};
