import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import globalErrorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Server is running...");
});




app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});