import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { pool } from "../config/db.js";
const ACCESS_COOKIE = "access_token";
function authenticate(req) {
    const token = req.cookies?.[ACCESS_COOKIE];
    if (!token) {
        return false;
    }
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    }
    catch {
        throw new AppError("Invalid or expired token", 401);
    }
    req.user = {
        id: payload.userId ?? payload.id,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
    };
    return true;
}
export function optionalAuth(req, _res, next) {
    try {
        authenticate(req);
        return next();
    }
    catch (error) {
        return next(error);
    }
}
export function requireAuth(req, _res, next) {
    try {
        if (!authenticate(req)) {
            throw new AppError("Authentication is required", 401);
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
}
export function requireRole(...roles) {
    return async (req, _res, next) => {
        if (!req.user) {
            return next(new AppError("Authentication is required", 401));
        }
        try {
            const result = await pool.query("SELECT role, status FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1", [req.user.id]);
            const currentUser = result.rows[0];
            if (!currentUser || currentUser.status !== "active") {
                return next(new AppError("Account is unavailable.", 401));
            }
            req.user.role = currentUser.role;
            if (!roles.includes(currentUser.role)) {
                return next(new AppError("You do not have permission to perform this action.", 403));
            }
            return next();
        }
        catch (error) {
            return next(error);
        }
    };
}
