const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config()
// const { PORT } = require("./utils/constants");
const { initializeRoutes } = require("./routes");
const { setMiddleware } = require("./middlewares/middlewares");

const app = express();
setMiddleware(app);
initializeRoutes(app);

const PORT  = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
