const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

router.get("/",staffController.getAllStaffs)
router.get("/downloads/attendence/:id",staffController.getAttendenceExcel)
router.get("/downloads/students/:id",staffController.getAllStudentsExcel)
router.post("/signup", staffController.signup);
router.post("/login", staffController.login);
router.get("/:id",staffController.getFullDetails)
router.post("/:id",staffController.addStudent)



module.exports = router;
