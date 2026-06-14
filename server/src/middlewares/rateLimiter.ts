import { rateLimit } from "express-rate-limit";
import AppError from "../utils/AppError.js";

export const routeLimiter = (
    windowMs: number,
    limit: number,
    message = "Too many requests. Please try again later."
) => {
    return rateLimit({
        windowMs: windowMs * 60 * 1000,
        limit,
        handler: (req, res, next) => {
            next(
                new AppError(
                    message,
                    429
                )
            );
        },
    });
};