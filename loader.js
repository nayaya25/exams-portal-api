// Packages Imports
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")

// MiddleWares Set Up
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(compression())
app.use(helmet())
app.use(cors(
    {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
))

module.exports  = app