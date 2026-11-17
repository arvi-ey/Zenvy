import { pool } from "../config/db.js";

const userTable = `users`;
const sessionTable = `session`;

export interface UserAttributes {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar?: string;
    user_type?: 'admin' | 'user';
}

export interface SessionBody {
    user_id: number;
    token_hash: string;
    expires_at: Date;
    max_expiry_date: Date;
}

export class AuthModel {
    static async createUser(user: UserAttributes, verificationToken: string, tokenExpiry: Date) {
        const query = `
            INSERT INTO ${userTable} 
                (first_name, last_name, email, phone, avatar, user_type, verification_token, verification_token_expires_at)
            VALUES 
                ($1, $2, $3, $4, $5, COALESCE($6, 'user'), $7, $8)
            RETURNING id, first_name, last_name, email, user_type, status, verified, created_at;
        `;
        const values = [
            user.first_name,
            user.last_name,
            user.email,
            user.phone,
            user.avatar || null,
            user.user_type || null,
            verificationToken,
            tokenExpiry,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email: string) {
        const { rows } = await pool.query(
            `SELECT * FROM ${userTable} WHERE email = $1 AND deleted_at IS NULL`,
            [email]
        );
        return rows[0];
    }

    static async findByVerificationToken(token: string) {
        const { rows } = await pool.query(
            `SELECT * FROM ${userTable} 
             WHERE verification_token = $1 
               AND deleted_at IS NULL`,
            [token]
        );
        return rows[0];
    }

    static async verifyUserAccount(userId: number) {
        const result = await pool.query(
            `UPDATE ${userTable} 
             SET verified = TRUE, 
                 verification_token = NULL, 
                 verification_token_expires_at = NULL
             WHERE id = $1 
             RETURNING id, email, verified`,
            [userId]
        );
        return result.rows[0];
    }

    static async createSession({
        user_id,
        token_hash,
        expires_at,
        max_expiry_date
    }: SessionBody) {
        const query = `
            INSERT INTO ${sessionTable} 
                (user_id, token_hash, expires_at, max_expiry_date)
            VALUES 
                ($1, $2, $3, $4)
            RETURNING id, user_id, expires_at, created_at;
        `;
        const values = [user_id, token_hash, expires_at, max_expiry_date];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    static async updateVerificationToken(userId: number, verificationToken: string, tokenExpiry: Date) {
        const result = await pool.query(
            `UPDATE ${userTable} 
             SET verification_token = $1, 
                 verification_token_expires_at = $2 
             WHERE id = $3 
             RETURNING id, email, first_name`,
            [verificationToken, tokenExpiry, userId]
        );
        return result.rows[0];
    }

    static async findValidSession(token_hash: string) {
        const query = `
            SELECT s.*, u.user_type, u.status, u.verified 
            FROM ${sessionTable} s
            INNER JOIN ${userTable} u ON u.id = s.user_id
            WHERE s.token_hash = $1 
              AND s.revoked = FALSE 
              AND s.expires_at > CURRENT_TIMESTAMP
              AND s.max_expiry_date > CURRENT_TIMESTAMP
              AND s.deleted_at IS NULL
              AND u.deleted_at IS NULL
        `;
        const { rows } = await pool.query(query, [token_hash]);
        return rows[0];
    }

    static async revokeSession(token_hash: string) {
        const result = await pool.query(
            `UPDATE ${sessionTable} 
             SET revoked = TRUE 
             WHERE token_hash = $1`,
            [token_hash]
        );
        return result.rowCount ?? 0;
    }
}