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

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies?.[ACCESS_COOKIE];

    if (!token) {
        return next(new AppError("Authentication is required", 401));
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthPayload;
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName,
            lastName: payload.lastName,
        };
        return next();
    } catch {

        return next(new AppError("Invalid or expired token", 401));
    }

}