const BlockedSite = require("../models/BlockedSite");

// Get all blocked sites
exports.getBlockedSites = async (req, res, next) => {
  try {
    const sites = await BlockedSite.find();
    res.json(sites);
  } catch (error) {
    next(error);
  }
};

// Add a new blocked site
exports.addBlockedSite = async (req, res, next) => {
  try {
    const { site } = req.body;
    const newSite = new BlockedSite({ site });
    await newSite.save();
    res.status(201).json(newSite);
  } catch (error) {
    next(error);
  }
};

// Unblock a site by id
exports.unblockSite = async (req, res, next) => {
  try {
    const { id } = req.params;
    await BlockedSite.findByIdAndDelete(id);
    res.status(200).json({ message: 'Site unblocked successfully' });
  } catch (error) {
    next(error);
  }
};
