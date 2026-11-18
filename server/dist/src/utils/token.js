import crypto from "crypto";
import jwt from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET || "your_access_secret_key";
const ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived access token
export class TokenUtils {
    /**
     * Generates a cryptographically secure random opaque token for the Refresh Token.
     */
    static generateRefreshToken() {
        return crypto.randomBytes(64).toString("hex");
    }
    /**
     * Hashes the refresh token using SHA-256 for secure database storage.
     */
    static hashToken(token) {
        return crypto.createHash("sha256").update(token).digest("hex");
    }
    /**
     * Generates a JSON Web Token (JWT) for access authentication containing userId and role.
     */
    static generateAccessToken(payload) {
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    }
    /**
     * Verifies and decodes an access token.
     */
    static verifyAccessToken(token) {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }
}
