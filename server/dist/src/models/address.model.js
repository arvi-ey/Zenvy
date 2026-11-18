import { pool } from "../config/db.js";
export class AddressModel {
    static async getByUserId(userId) {
        const { rows } = await pool.query(`SELECT
                id,
                street,
                landmark,
                pincode,
                state,
                district,
                type,
                created_at AS "createdAt"
             FROM address
             WHERE user_id = $1 AND deleted_at IS NULL
             ORDER BY created_at DESC, id DESC`, [userId]);
        return rows;
    }
    static async create(userId, address) {
        const { rows } = await pool.query(`INSERT INTO address (user_id, street, landmark, pincode, state, district, type)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING
                id,
                street,
                landmark,
                pincode,
                state,
                district,
                type,
                created_at AS "createdAt"`, [
            userId,
            address.street,
            address.landmark ?? null,
            address.pincode,
            address.state,
            address.district,
            address.type,
        ]);
        return rows[0];
    }
    static async delete(userId, addressId) {
        const result = await pool.query(`UPDATE address
             SET deleted_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
             RETURNING id`, [addressId, userId]);
        return result.rowCount ?? 0;
    }
}
