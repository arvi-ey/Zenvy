// middleware/cart.middleware.ts
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const GUEST_COOKIE = "guest_token";
const EXPIRFED_TIME = 100 * 24 * 60 * 60 * 1000;

const GUEST_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: EXPIRFED_TIME,
};


export function ensureGuestToken(req: Request, res: Response, next: NextFunction) {

    if (req.user?.id) {
        return next();
    }

    const existing = req.cookies?.[GUEST_COOKIE];

    if (typeof existing === "string" && existing.length > 0) {
        req.guest_token = existing;
        return next();
    }


    const token = crypto.randomUUID();
    res.cookie(GUEST_COOKIE, token, GUEST_COOKIE_OPTIONS);
    req.guest_token = token;
    next();
}