const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(express.json());

module.exports = app;
