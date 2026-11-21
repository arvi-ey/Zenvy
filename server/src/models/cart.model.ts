import { pool } from "../config/db.js";
import AppError from "../utils/AppError.js";




export interface CartBody {
    product_id: number,
    product_count: number,
    variant_id?: number,
    user_id?: number,
    guest_token?: string,


}


const tableName = `cart`

export class CartModel {
    static async deleteFromCart({
        product_id,
        variant_id,
        user_id,
        guest_token,
    }: Pick<CartBody, "product_id" | "variant_id" | "user_id" | "guest_token">) {
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
               AND ($2::int IS NULL OR variant_id = $2)
               AND ${ownerColumn} = $3
               AND deleted_at IS NULL
             RETURNING id`,
            [product_id, variant_id ?? null, ownerValue]
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
                COALESCE(product_stock.available_stock, 0)::int AS stock,
                c.variant_id,
                pv.size AS selected_size,
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
                    json_build_object(
                        'variant_id', pv.id,
                        'size', pv.size,
                        'total_stock', COALESCE(i.total_stock, 0),
                        'reserved_stock', COALESCE(i.reserved_stock, 0),
                        'stock', GREATEST(COALESCE(i.total_stock - i.reserved_stock, 0), 0)
                    )
                    ORDER BY pv.id
                ) AS items
                FROM product_variants AS pv
                LEFT JOIN inventory AS i ON i.variant_id = pv.id
                WHERE pv.product_id = p.id
             ) AS variants ON TRUE
             LEFT JOIN product_variants AS pv ON pv.id = c.variant_id AND pv.product_id = p.id
             LEFT JOIN LATERAL (
                SELECT SUM(GREATEST(COALESCE(i.total_stock - i.reserved_stock, 0), 0)) AS available_stock
                FROM product_variants AS pv
                LEFT JOIN inventory AS i ON i.variant_id = pv.id
                WHERE pv.product_id = p.id
             ) AS product_stock ON TRUE
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
        variant_id,
        guest_token,
        user_id,
    }: CartBody) {

        if (!user_id && !guest_token) {
            throw new Error("Either user_id or guest_token is required");
        }
        if (user_id && guest_token) {
            throw new Error("user_id and guest_token cannot be used together");
        }
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            let selectedVariantId = variant_id;
            const inventory = await client.query(
                `SELECT pv.id AS variant_id,
                        i.total_stock - i.reserved_stock AS available_stock
                 FROM product_variants AS pv
                 INNER JOIN inventory AS i ON i.variant_id = pv.id
                 INNER JOIN product AS p ON p.id = pv.product_id
                 WHERE pv.product_id = $2 AND ($1::int IS NULL OR pv.id = $1)
                   AND ($1::int IS NOT NULL OR i.total_stock > i.reserved_stock)
                   AND p.deleted_at IS NULL AND p.status = 'active'
                 ORDER BY pv.id
                 LIMIT 1
                 FOR UPDATE OF i`,
                [selectedVariantId ?? null, product_id]
            );
            if (!inventory.rowCount) {
                throw new AppError("This size is unavailable.", 409);
            }
            selectedVariantId = Number(inventory.rows[0].variant_id);
            const availableStock = Number(inventory.rows[0].available_stock);
            const existingCartItem = await client.query(
                `SELECT id, product_count FROM ${tableName}
                 WHERE product_id = $1 AND variant_id = $2
                   AND ${user_id ? "user_id = $3" : "guest_token = $3"}
                   AND deleted_at IS NULL
                 FOR UPDATE`,
                [product_id, selectedVariantId, user_id ?? guest_token]
            );
            const requestedCount = Math.min(
                Number(existingCartItem.rows[0]?.product_count ?? 0) + product_count,
                10
            );
            if (requestedCount > availableStock) {
                throw new AppError(
                    availableStock > 0
                        ? `Only ${availableStock} available for this size.`
                        : "This size is out of stock.",
                    409
                );
            }

            if (user_id) {
                const result = existingCartItem.rowCount
                    ? await client.query(
                        `UPDATE ${tableName}
                         SET product_count = LEAST(product_count + $1, 10),
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2
                         RETURNING *`,
                        [product_count, existingCartItem.rows[0].id]
                    )
                    : await client.query(
                        `INSERT INTO ${tableName} (product_id, variant_id, product_count, user_id)
                         VALUES ($1, $2, $3, $4)
                         RETURNING *`,
                        [product_id, selectedVariantId, product_count, user_id]
                    );
                await client.query("COMMIT");
                return result.rows[0];
            }
            await client.query(
                "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
                [guest_token!, `${product_id}:${selectedVariantId}`]
            );

            let result;
            if (existingCartItem.rowCount) {
                result = await client.query(
                    `UPDATE ${tableName}
                     SET product_count = LEAST(product_count + $1, 10),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2
                     RETURNING *`,
                    [product_count, existingCartItem.rows[0].id]
                );
            } else {
                result = await client.query(
                    `INSERT INTO ${tableName} (product_id, variant_id, product_count, guest_token)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                    [product_id, selectedVariantId, product_count, guest_token!]
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