const express = require("express");
const { getBlockedSites, addBlockedSite, unblockSite } = require("../controllers/blockedSites");
const router = express.Router();

router.get("/", getBlockedSites);
router.post("/", addBlockedSite);
router.delete("/:id", unblockSite);

module.exports = router; 