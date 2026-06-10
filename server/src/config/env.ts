import dotenv from "dotenv";

dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: process.env.PORT!,
    DATABASE_URL: process.env.DATABASE_URL!,
    DIRECT_URL: process.env.DIRECT_URL!,
    MAIL_API_KEY: process.env.MAIL_API_KEY!,
    FRONTEND_BASE_URL_DEV: process.env.FRONTEND_BASE_URL_DEV!,
    FRONTEND_BASE_URL_PROD: process.env.FRONTEND_BASE_URL_PROD!,
    API_VERSION: process.env.API_VERSION!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
};