const express = require("express");
const cors = require("cors");

function setMiddleware(app) {
  app.use(express.json());
  app.use(cors({ origin: "*" }));
}

module.exports = { setMiddleware };
