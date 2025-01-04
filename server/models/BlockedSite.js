const mongoose = require('mongoose');

const BlockedSiteSchema = new mongoose.Schema({
  site: { type: String, required: true },
});

module.exports = mongoose.model('BlockedSite', BlockedSiteSchema);
