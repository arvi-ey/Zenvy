// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import { pool } from "../config/db.js";
import { TokenUtils, type TokenPayload } from "../utils/token.js";

export interface AuthPayload {
    id: number;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
            guest_token?: string;
        }
    }
}

const ACCESS_COOKIE = "access_token";

function authenticate(req: Request): boolean {
    const token = req.cookies?.[ACCESS_COOKIE];

    if (!token) {
        return false;
    }

    let payload: TokenPayload;
    try {
        payload = TokenUtils.verifyAccessToken(token);
        if (!Number.isSafeInteger(payload.userId) || typeof payload.role !== "string") {
            throw new Error("Invalid access token payload");
        }
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }

    req.user = {
        id: payload.userId,
        role: payload.role,
    };
    return true;
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        authenticate(req);
        return next();
    } catch (error) {
        return next(error);
    }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        if (!authenticate(req)) {
            throw new AppError("Authentication is required", 401);
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

export function requireRole(...roles: string[]) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Authentication is required", 401));
        }
        try {
            const result = await pool.query<{ role: string; status: string }>(
                "SELECT user_type AS role, status FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
                [req.user.id]
            );
            const currentUser = result.rows[0];
            if (!currentUser || currentUser.status !== "active") {
                return next(new AppError("Account is unavailable.", 401));
            }
            req.user.role = currentUser.role;
            if (!roles.includes(currentUser.role)) {
                return next(new AppError("You do not have permission to perform this action.", 403));
            }
            return next();
        } catch (error) {
            return next(error);
        }
    };
}