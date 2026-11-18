import crypto from "crypto";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived access token

function getAccessTokenSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET must be configured.");
    }
    return secret;
}

export interface TokenPayload {
    userId: number;
    role: string;
}

export class TokenUtils {
    /**
     * Generates a cryptographically secure random opaque token for the Refresh Token.
     */
    static generateRefreshToken(): string {
        return crypto.randomBytes(64).toString("hex");
    }

    /**
     * Hashes the refresh token using SHA-256 for secure database storage.
     */
    static hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    /**
     * Generates a JSON Web Token (JWT) for access authentication containing userId and role.
     */
    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, getAccessTokenSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
    }

    /**
     * Verifies and decodes an access token.
     */
    static verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, getAccessTokenSecret()) as TokenPayload;
    }
}