import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

const allowedOrigins = new Set([
    new URL(env.NODE_ENV === "production"
        ? env.FRONTEND_BASE_URL_PROD
        : env.FRONTEND_BASE_URL_DEV).origin,
]);

if (env.NODE_ENV !== "production") {
    allowedOrigins.add("http://localhost:3000");
    allowedOrigins.add("http://127.0.0.1:3000");
}

export function validateAuthOrigin(req: Request, _res: Response, next: NextFunction) {
    const origin = req.get("origin");
    if (origin && !allowedOrigins.has(origin)) {
        return next(new AppError("Request origin is not allowed.", 403));
    }
    return next();
}
