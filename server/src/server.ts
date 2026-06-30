import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import authRouter from "./router/authrouter.js"
import { getDeviceInfo } from "./helpers/helper.js";
import { routeLimiter } from "./middlewares/rateLimiter.js";
import { pool } from "./config/db.js";



const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = env.PORT || 5000;


async function connectDB() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
}

connectDB();





app.use(`${env.API_VERSION}/auth`, authRouter)


app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}, mode: ${env.NODE_ENV}`);
});














//Most used prisma comands

// npx prisma format
// npx prisma migrate dev --name product-category-image-table-added

// npx prisma studio
// npx prisma generate