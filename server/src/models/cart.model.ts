import { pool } from "../config/db.js";




export interface CartBody {
    product_id: number,
    product_count: number,
    user_id?: number,
    guest_token?: string,


}


const tableName = `cart`

export class CartModel {

    static async addToCart({
        product_count,
        product_id,
        guest_token,
        user_id,
    }: CartBody) {

        if (!user_id && !guest_token) {
            throw new Error("Either user_id or guest_token is required");
        }
        if (user_id && guest_token) {
            throw new Error("user_id and guest_token cannot be used together");
        }
        let query: string;
        let values: (number | string)[];

        if (user_id) {
            query = `
                INSERT INTO ${tableName} as c
                    (product_id, product_count, user_id)
                VALUES
                    ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                WHERE user_id IS NOT NULL
                AND deleted_at IS NULL
                DO UPDATE SET
                    product_count = LEAST(
                        c.product_count + EXCLUDED.product_count,
                        10
                    )
                RETURNING *;
            `;

            values = [
                product_id,
                product_count,
                user_id,
            ];

        }

        else {

            query = `
                INSERT INTO ${tableName} as c
                    (product_id, product_count, guest_token)
                VALUES
                    ($1, $2, $3)
                ON CONFLICT (guest_token, product_id)
                WHERE guest_token IS NOT NULL
                AND deleted_at IS NULL
                DO UPDATE SET
                    product_count = LEAST(
                        c.product_count + EXCLUDED.product_count,
                        10
                    )
                RETURNING *;
            `;

            values = [
                product_id,
                product_count,
                guest_token!,
            ];
        }

        const result = await pool.query(query, values);

        return result.rows[0];
    }

}