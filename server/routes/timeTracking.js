const express = require("express");
const { getTimeTracking, addTimeSpent } = require("../controllers/timeTracking");
const router = express.Router();

router.get("/", getTimeTracking);
router.post("/", addTimeSpent);

module.exports = router;
