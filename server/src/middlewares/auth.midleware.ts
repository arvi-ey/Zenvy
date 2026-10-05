// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

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

    let payload: AuthPayload;
    try {
        payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthPayload;
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }

    req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
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