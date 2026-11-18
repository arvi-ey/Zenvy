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
    allowedOrigins.add("http://localhost:3001");
    allowedOrigins.add("http://127.0.0.1:3001");
}
if (env.ADMIN_BASE_URL) {
    allowedOrigins.add(new URL(env.ADMIN_BASE_URL).origin);
}
export function validateAuthOrigin(req, _res, next) {
    const origin = req.get("origin");
    if (origin && !allowedOrigins.has(origin)) {
        return next(new AppError("Request origin is not allowed.", 403));
    }
    return next();
}
