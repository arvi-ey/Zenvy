import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import ProductCategoryRouter from "./routes/productcategory.route.js"
import ProductRouter from "./routes/product.route.js"

import fs from "node:fs";

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db connection
connectDB()

const PORT = env.PORT || 5000;






// converter()


//Routes
app.use(`${env.API_VERSION}/product-category`, ProductCategoryRouter)
app.use(`${env.API_VERSION}/product`, ProductRouter)


app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}, mode: ${env.NODE_ENV}`);
});














//Most used prisma comands

// npx prisma format
// npx prisma migrate dev --name product-category-image-table-added

// npx prisma studio
// npx prisma generate