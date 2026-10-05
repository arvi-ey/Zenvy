import { pool } from "../config/db.js";




export interface CartBody {
    product_id: number,
    product_count: number,
    user_id?: number,
    guest_token?: string,


}


const tableName = `cart`

export class CartModel {
    static async deleteFromCart({
        product_id,
        user_id,
        guest_token,
    }: Pick<CartBody, "product_id" | "user_id" | "guest_token">) {
        if (!user_id && !guest_token) {
            throw new Error("Either user_id or guest_token is required");
        }
        if (user_id && guest_token) {
            throw new Error("user_id and guest_token cannot be used together");
        }

        const ownerColumn = user_id ? "user_id" : "guest_token";
        const ownerValue = user_id ?? guest_token;
        const result = await pool.query(
            `UPDATE ${tableName}
             SET deleted_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE product_id = $1
               AND ${ownerColumn} = $2
               AND deleted_at IS NULL
             RETURNING id`,
            [product_id, ownerValue]
        );

        return result.rowCount ?? 0;
    }

    static async getCart({
        user_id,
        guest_token,
    }: Pick<CartBody, "user_id" | "guest_token">) {
        if (!user_id && !guest_token) {
            throw new Error("Either user_id or guest_token is required");
        }
        if (user_id && guest_token) {
            throw new Error("user_id and guest_token cannot be used together");
        }

        const ownerColumn = user_id ? "c.user_id" : "c.guest_token";
        const ownerValue = user_id ?? guest_token;
        const { rows } = await pool.query(
            `SELECT
                c.id AS cart_id,
                c.product_count,
                p.id,
                p.name,
                p.slug,
                p.description,
                p.price::float8 AS price,
                p.stock::float8 AS stock,
                p.is_featured AS featured,
                pc.slug AS category,
                COALESCE(images.items, '[]'::json) AS images,
                COALESCE(variants.items, '[]'::json) AS sizes
             FROM ${tableName} AS c
             INNER JOIN product AS p ON p.id = c.product_id
             INNER JOIN product_category AS pc ON pc.id = p.category_id
             LEFT JOIN LATERAL (
                SELECT json_agg(
                    json_build_object('url', pi.url, 'is_main', pi.is_main)
                    ORDER BY pi.is_main DESC, pi.id
                ) AS items
                FROM product_images AS pi
                WHERE pi.product_id = p.id AND pi.deleted_at IS NULL
             ) AS images ON TRUE
             LEFT JOIN LATERAL (
                SELECT json_agg(
                    json_build_object('size', pv.size, 'stock', pv.stock)
                    ORDER BY pv.id
                ) AS items
                FROM product_variants AS pv
                WHERE pv.product_id = p.id
             ) AS variants ON TRUE
             WHERE ${ownerColumn} = $1
               AND c.deleted_at IS NULL
               AND p.deleted_at IS NULL
             ORDER BY c.created_at DESC`,
            [ownerValue]
        );

        return rows;
    }

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
        if (user_id) {
            const query = `
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

            const values = [
                product_id,
                product_count,
                user_id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(
                "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
                [guest_token!, String(product_id)]
            );

            const existing = await client.query(
                `SELECT id
                 FROM ${tableName}
                 WHERE guest_token = $1
                   AND product_id = $2
                   AND deleted_at IS NULL
                 ORDER BY id
                 LIMIT 1
                 FOR UPDATE`,
                [guest_token!, product_id]
            );

            let result;
            if (existing.rowCount) {
                result = await client.query(
                    `UPDATE ${tableName}
                     SET product_count = LEAST(product_count + $1, 10),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2
                     RETURNING *`,
                    [product_count, existing.rows[0].id]
                );
            } else {
                result = await client.query(
                    `INSERT INTO ${tableName} (product_id, product_count, guest_token)
                     VALUES ($1, $2, $3)
                     RETURNING *`,
                    [product_id, product_count, guest_token!]
                );
            }

            await client.query("COMMIT");
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

}