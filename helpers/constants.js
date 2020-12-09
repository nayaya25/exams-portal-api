require("dotenv").config()

const DESK_API_KEY = process.env.DESK_API_KEY;
const DESK_API_SECRET = process.env.DESK_API_SECRET;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const API_URL = process.env.API_URL;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;

module.exports = {
    DESK_API_KEY,
    DESK_API_SECRET,
    PORT,
    JWT_SECRET,
    API_URL,
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_USER
}