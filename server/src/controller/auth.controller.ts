import { randomBytes, createHash } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { sendResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface AuthUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface RefreshPayload extends jwt.JwtPayload {
    sub: string;
    sid: number;
    type: "refresh";
}

function cookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    };
}

function tokenHash(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

function createRefreshToken(user: AuthUser, sessionId: number) {
    return jwt.sign(
        {
            sub: String(user.id),
            sid: sessionId,
            type: "refresh",
            nonce: randomBytes(16).toString("hex"),
        },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] }
    );
}

function createAccessToken(user: AuthUser) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: "customer",
            firstName: user.firstName,
            lastName: user.lastName,
        },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] }
    );
}

function setAuthCookies(res: Response, user: AuthUser, refreshToken: string) {
    const options = cookieOptions();
    const accessMaxAge = Number(env.ACCESS_TOKEN_MAX_AGE);

    res.cookie(ACCESS_COOKIE, createAccessToken(user), {
        ...options,
        maxAge: Number.isFinite(accessMaxAge) && accessMaxAge > 0
            ? accessMaxAge
            : 15 * 60 * 1000,
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
        ...options,
        maxAge: REFRESH_TTL_MS,
    });
}

function authResponse(user: AuthUser, refreshToken: string) {
    return {
        user,
        accessToken: createAccessToken(user),
    };
}

function clearAuthCookies(res: Response) {
    const options = cookieOptions();
    res.clearCookie(ACCESS_COOKIE, options);
    res.clearCookie(REFRESH_COOKIE, options);
}

async function createSession(user: AuthUser) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
        const session = await client.query<{ id: number }>(
            `INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [user.id, randomBytes(32).toString("hex"), expiresAt]
        );
        const sessionId = Number(session.rows[0].id);
        const refreshToken = createRefreshToken(user, sessionId);
        await client.query(
            `UPDATE auth_sessions
             SET refresh_token_hash = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [tokenHash(refreshToken), sessionId]
        );
        await client.query("COMMIT");
        return refreshToken;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

function toUser(row: Record<string, unknown>): AuthUser {
    return {
        id: Number(row.id),
        firstName: String(row.first_name),
        lastName: String(row.last_name),
        email: String(row.email),
        phone: String(row.phone),
    };
}

export const signUp = catchAsync(async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, password } = req.body as {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
    };
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = await pool.query(
        "SELECT id FROM users WHERE lower(email) = $1 OR phone = $2 LIMIT 1",
        [normalizedEmail, phone.trim()]
    );
    if (duplicate.rowCount) {
        throw new AppError("An account with this email or phone already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const created = await pool.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, status, verified)
         VALUES ($1, $2, $3, $4, $5, 'active', TRUE)
         RETURNING id, first_name, last_name, email, phone`,
        [firstName.trim(), lastName.trim(), normalizedEmail, phone.trim(), passwordHash]
    );
    const user = toUser(created.rows[0]);
    const refreshToken = await createSession(user);
    setAuthCookies(res, user, refreshToken);
    sendResponse(res, 201, "Account created successfully", authResponse(user, refreshToken));
});

export const signIn = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await pool.query(
        `SELECT id, first_name, last_name, email, phone, password_hash, status
         FROM users
         WHERE lower(email) = $1 AND deleted_at IS NULL
         LIMIT 1`,
        [email.trim().toLowerCase()]
    );
    const row = result.rows[0] as
        | (Record<string, unknown> & { password_hash: string | null; status: string })
        | undefined;
    const validPassword = row?.password_hash
        ? await bcrypt.compare(password, row.password_hash)
        : false;
    if (!row || !validPassword || row.status !== "active") {
        throw new AppError("Invalid email or password.", 401);
    }

    const user = toUser(row);
    const refreshToken = await createSession(user);
    setAuthCookies(res, user, refreshToken);
    sendResponse(res, 200, "Signed in successfully", authResponse(user, refreshToken));
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Authentication is required.", 401);

    const result = await pool.query(
        `SELECT id, first_name, last_name, email, phone
         FROM users
         WHERE id = $1 AND status = 'active' AND deleted_at IS NULL
         LIMIT 1`,
        [userId]
    );
    if (!result.rowCount) throw new AppError("Account is unavailable.", 401);
    const user = toUser(result.rows[0]);
    sendResponse(res, 200, "Session restored", {
        user,
        accessToken: createAccessToken(user),
    });
});

export const refreshSession = catchAsync(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) throw new AppError("Authentication is required.", 401);

    let payload: RefreshPayload;
    try {
        const decoded = jwt.verify(rawToken, env.JWT_REFRESH_SECRET);
        if (
            typeof decoded === "string" ||
            decoded.type !== "refresh" ||
            typeof decoded.sub !== "string" ||
            typeof decoded.sid !== "number"
        ) {
            throw new Error("Invalid refresh token");
        }
        payload = decoded as RefreshPayload;
    } catch {
        clearAuthCookies(res);
        throw new AppError("Your session has expired. Please sign in again.", 401);
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const session = await client.query(
            `SELECT s.id, u.id AS user_id, u.first_name, u.last_name, u.email, u.phone
             FROM auth_sessions s
             INNER JOIN users u ON u.id = s.user_id
             WHERE s.id = $1
               AND s.user_id = $2
               AND s.refresh_token_hash = $3
               AND s.revoked_at IS NULL
               AND s.expires_at > CURRENT_TIMESTAMP
               AND u.status = 'active'
               AND u.deleted_at IS NULL
             FOR UPDATE OF s`,
            [payload.sid, Number(payload.sub), tokenHash(rawToken)]
        );
        if (!session.rowCount) {
            await client.query("ROLLBACK");
            clearAuthCookies(res);
            throw new AppError("Your session has expired. Please sign in again.", 401);
        }

        const row = session.rows[0] as Record<string, unknown>;
        const user = toUser({
            id: row.user_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
        });
        const nextRefreshToken = createRefreshToken(user, Number(row.id));
        const updated = await client.query(
            `UPDATE auth_sessions
             SET refresh_token_hash = $1,
                 expires_at = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND refresh_token_hash = $4 AND revoked_at IS NULL`,
            [
                tokenHash(nextRefreshToken),
                new Date(Date.now() + REFRESH_TTL_MS),
                row.id,
                tokenHash(rawToken),
            ]
        );
        if (!updated.rowCount) {
            await client.query("ROLLBACK");
            clearAuthCookies(res);
            throw new AppError("Your session has expired. Please sign in again.", 401);
        }
        await client.query("COMMIT");
        setAuthCookies(res, user, nextRefreshToken);
        sendResponse(res, 200, "Session refreshed", authResponse(user, nextRefreshToken));
    } catch (error) {
        if (!(error instanceof AppError)) await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
});

export const signOut = catchAsync(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (rawToken) {
        let decoded: string | jwt.JwtPayload;
        try {
            decoded = jwt.verify(rawToken, env.JWT_REFRESH_SECRET);
        } catch (error: unknown) {
            if (!(error instanceof jwt.JsonWebTokenError)) throw error;
            decoded = "";
        }
        if (typeof decoded !== "string" && typeof decoded.sid === "number") {
            await pool.query(
                `UPDATE auth_sessions
                 SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 AND refresh_token_hash = $2 AND revoked_at IS NULL`,
                [decoded.sid, tokenHash(rawToken)]
            );
        }
    }
    clearAuthCookies(res);
    sendResponse(res, 200, "Signed out successfully");
});
