import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import authRouter from "./router/authrouter.js"



const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Server is running...");
});






app.use(`${process.env.API_VERSION}/auth`, authRouter)


app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});














//Most used prisma comands

// npx prisma format
// npx prisma migrate dev--name your_change
// npx prisma studio
// npx prisma generate