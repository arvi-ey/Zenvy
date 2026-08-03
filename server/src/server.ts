import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { getDeviceInfo } from "./helpers/helper.js";
import { routeLimiter } from "./middlewares/rateLimiter.js";
import { connectDB } from "./config/db.js";



const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db connection
connectDB()

const PORT = env.PORT || 5000;



app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}, mode: ${env.NODE_ENV}`);
});














//Most used prisma comands

// npx prisma format
// npx prisma migrate dev --name product-category-image-table-added

// npx prisma studio
// npx prisma generate