// Packages Imports
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const router = require("./routes");

// MiddleWares Set Up
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 5 * 1024 * 1024 * 1024, //5MB max file(s) size
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Router

app.use(router);

module.exports = app;
