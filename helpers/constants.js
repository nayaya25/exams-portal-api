require("dotenv").config();


module.exports = {
    DESK_API_KEY: process.env.DESK_API_KEY,
    DESK_API_SECRET: process.env.DESK_API_SECRET,
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    API_URL: process.env.API_URL,
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT,
    DATABASE_URL: process.env.DATABASE_URL
}