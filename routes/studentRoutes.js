const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/",studentController.getAll)
router.get("/:id", studentController.get);

module.exports = router;
