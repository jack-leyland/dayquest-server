import dotenv from 'dotenv'
dotenv.config("../")

export default {
    port: process.env.PORT || 8080,
    isProduction: process.env.NODE_ENV === "production",
    authDBUrl: process.env.AUTH_DB_URL,
    testDBUrl: process.env.TEST_DB_URL,
    DBUrl: process.env.DB_URL,
    access_secret: process.env.ACCESS_TOKEN_PRIVATE_KEY,
    refresh_secret: process.env.REFRESH_TOKEN_PRIVATE_KEY,
    access_ttl: process.env.ACCESS_TOKEN_EXPIRATION_STRING,
    refresh_ttl: process.env.REFRESH_TOKEN_EXPIRATION_STRING
}