const staffRoutes = require("./staffRoutes");
const studentRoutes = require("./studentRoutes");
const attendenceRoutes = require("./attendenceRoutes")

function initializeRoutes(app) {
  app.use("/staff", staffRoutes);
  app.use("/students", studentRoutes);
  app.use("/attendance",attendenceRoutes)
}

module.exports = { initializeRoutes };
