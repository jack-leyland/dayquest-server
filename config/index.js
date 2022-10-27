import dotenv from 'dotenv'
dotenv.config("../")
export default {
    port: process.env.PORT || 8080,
    isProduction: process.env.NODE_ENV === "production",
    dbUrl: process.env.DB_URL
}