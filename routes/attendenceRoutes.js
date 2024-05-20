const express = require("express");
const router = express.Router();
const attendenceController = require("../controllers/attendenceController")

router.put("/",attendenceController.putAttendence)
router.get("/weekly/:section",attendenceController.weeklyData)
router.get("/monthly/:section",attendenceController.monthlyData)
router.get("/details/:section",attendenceController.details)

module.exports = router;