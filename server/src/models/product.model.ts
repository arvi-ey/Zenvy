
import { pool } from "../config/db.js";
import AppError from "../utils/AppError.js";



interface GetProductsOptions {
    limit?: number;
    offset?: number;
    category?: string;
    orderBy?: "ASC" | "DESC";
    is_featured?: boolean
    includeAllStatuses?: boolean;
}


interface getProductdetailsOption {
    slug?: string | undefined,
    id?: number | undefined,
    includeAllStatuses?: boolean
}

export class ProductModel {
    static async getProducts({
        limit = 10,
        offset,
        category,
        orderBy = "ASC",
        is_featured,
        includeAllStatuses = false,
    }: GetProductsOptions = {}) {

        let query = `
        SELECT
            p.* ,
            pc.name AS category_name,
            COALESCE(stock_summary.available_stock, 0)::int AS stock,
            COALESCE(stock_summary.total_stock, 0)::int AS total_stock,
            COALESCE(stock_summary.reserved_stock, 0)::int AS reserved_stock,
            COALESCE(stock_summary.stocks, '[]'::jsonb) AS stocks,
            JSONB_AGG(
                JSON_BUILD_OBJECT(
                    'url', pi.url,
                    'is_main', pi.is_main
                )
            ) AS images
        FROM product AS p
        INNER JOIN product_images AS pi
            ON p.id = pi.product_id AND pi.deleted_at IS NULL
            INNER JOIN product_category as pc on pc.id = p.category_id
            LEFT JOIN LATERAL (
                SELECT
                    SUM(COALESCE(i.total_stock - i.reserved_stock, 0)) AS available_stock,
                    SUM(COALESCE(i.total_stock, 0)) AS total_stock,
                    SUM(COALESCE(i.reserved_stock, 0)) AS reserved_stock,
                    JSONB_AGG(
                        JSON_BUILD_OBJECT(
                            'variant_id', pv.id,
                            'size', pv.size,
                            'total_stock', COALESCE(i.total_stock, 0),
                            'reserved_stock', COALESCE(i.reserved_stock, 0),
                            'available_stock', GREATEST(COALESCE(i.total_stock - i.reserved_stock, 0), 0),
                            'stock', GREATEST(COALESCE(i.total_stock - i.reserved_stock, 0), 0)
                        ) ORDER BY pv.id
                    ) AS stocks
                FROM product_variants AS pv
                LEFT JOIN inventory AS i ON i.variant_id = pv.id
                WHERE pv.product_id = p.id
            ) AS stock_summary ON TRUE
        WHERE p.deleted_at IS NULL AND pc.deleted_at IS NULL
    `;
        if (!includeAllStatuses) {
            query += " AND p.status = 'active' AND pc.status = 'active'";
        }

        const values: (number | string | boolean)[] = [];
        let paramIndex = 0;

        if (category !== undefined && category !== "all") {
            paramIndex += 1
            query += ` AND pc.slug = $${paramIndex}`;
            values.push(category);

        }

        if (is_featured !== undefined) {
            paramIndex += 1
            query += ` AND p.is_featured = $${paramIndex}`
            values.push(is_featured)
        }

        const order = orderBy === "DESC" ? "DESC" : "ASC";

        let finalQuery = `${query} GROUP BY p.id, pc.name, stock_summary.available_stock, stock_summary.total_stock, stock_summary.reserved_stock, stock_summary.stocks ORDER BY p.price ${order}`;


        if (limit !== undefined && limit > 0) {
            paramIndex += 1
            finalQuery += ` LIMIT $${paramIndex}`;
            values.push(limit);

        }

        if (offset !== undefined && offset >= 0) {
            paramIndex += 1
            finalQuery += ` OFFSET $${paramIndex}`;
            values.push(offset);

        }

        finalQuery += `;`;


        const { rows } = await pool.query(finalQuery, values);

        return rows ?? null;
    }

    static async getAdminProducts() {
        return this.getProducts({ limit: 1000, includeAllStatuses: true });
    }

    static async update(
        id: number,
        data: {
            name: string;
            description: string;
            sku: string;
            category_id: number;
            stock?: number;
            variants?: { size: string; total_stock: number }[];
            price: number;
            compare_at_price?: number | null;
            cost_price?: number | null;
            low_stock_threshold: number;
            tags: string[];
            status: "active" | "inactive" | "draft";
            images: string[];
        }
    ) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const result = await client.query(
                `UPDATE product
                 SET name = $1, description = $2, sku = $3, category_id = $4, price = $5,
                     compare_at_price = $6, cost_price = $7, low_stock_threshold = $8, tags = $9, status = $10
                 WHERE id = $11 AND deleted_at IS NULL
                 RETURNING *`,
                [
                    data.name,
                    data.description,
                    data.sku,
                    data.category_id,
                    data.price,
                    data.compare_at_price ?? null,
                    data.cost_price ?? null,
                    data.low_stock_threshold,
                    data.tags,
                    data.status,
                    id,
                ]
            );
            if (!result.rowCount) {
                await client.query("ROLLBACK");
                return null;
            }

            let variants = data.variants;
            if (!variants && data.stock !== undefined) {
                const existingVariants = await client.query(
                    `SELECT pv.id, pv.size, COALESCE(i.reserved_stock, 0) AS reserved_stock
                     FROM product_variants AS pv
                     LEFT JOIN inventory AS i ON i.variant_id = pv.id
                     WHERE pv.product_id = $1
                     ORDER BY pv.id`,
                    [id]
                );
                if ((existingVariants.rowCount ?? 0) > 1) {
                    throw new AppError("Provide stock for each product variant.", 400);
                }
                if (existingVariants.rowCount === 1) {
                    variants = [{
                        size: existingVariants.rows[0].size,
                        total_stock: data.stock + Number(existingVariants.rows[0].reserved_stock),
                    }];
                } else {
                    variants = [{ size: "FREE", total_stock: data.stock }];
                }
            }
            if (data.variants !== undefined) {
                await client.query(
                    `UPDATE inventory
                     SET total_stock = reserved_stock, updated_at = CURRENT_TIMESTAMP
                     WHERE variant_id IN (
                         SELECT pv.id
                         FROM product_variants AS pv
                         WHERE pv.product_id = $1 AND NOT (pv.size = ANY($2::varchar[]))
                     )`,
                    [id, variants?.map((variant) => variant.size) ?? []]
                );
            }
            for (const variant of variants ?? []) {
                const variantResult = await client.query(
                    `INSERT INTO product_variants (product_id, size)
                     VALUES ($1, $2)
                     ON CONFLICT (product_id, size) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                     RETURNING id`,
                    [id, variant.size]
                );
                const variantId = variantResult.rows[0].id;
                const inventoryResult = await client.query(
                    `INSERT INTO inventory (variant_id, total_stock)
                     VALUES ($1, $2)
                     ON CONFLICT (variant_id) DO UPDATE
                     SET total_stock = EXCLUDED.total_stock,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE inventory.reserved_stock <= EXCLUDED.total_stock
                     RETURNING variant_id`,
                    [variantId, variant.total_stock]
                );
                if (!inventoryResult.rowCount) {
                    throw new AppError("Total stock cannot be lower than reserved stock.", 409);
                }
            }

            await client.query(
                "UPDATE product_images SET deleted_at = CURRENT_TIMESTAMP WHERE product_id = $1 AND deleted_at IS NULL",
                [id]
            );
            for (const [index, url] of data.images.entries()) {
                await client.query(
                    "INSERT INTO product_images (url, product_id, is_main) VALUES ($1, $2, $3)",
                    [url, id, index === 0]
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

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            "UPDATE product SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL",
            [id]
        );
        return result.rowCount === 1;
    }

    static async bulkUpdateStatus(ids: number[], status: "active" | "inactive" | "draft") {
        const result = await pool.query(
            `UPDATE product
             SET status = $1
             WHERE id = ANY($2::int[]) AND deleted_at IS NULL`,
            [status, ids]
        );
        return result.rowCount ?? 0;
    }

    static async bulkDelete(ids: number[]) {
        const result = await pool.query(
            `UPDATE product
             SET deleted_at = CURRENT_TIMESTAMP
             WHERE id = ANY($1::int[]) AND deleted_at IS NULL`,
            [ids]
        );
        return result.rowCount ?? 0;
    }


    static async getproductdetails({ id, slug, includeAllStatuses = false }: getProductdetailsOption = {}) {

        const values: (number | string)[] = [];
        let whereClause = "";
        if (id !== undefined) {
            values.push(id);
            whereClause = `p.id = $${values.length}`;
        }
        if (slug !== undefined) {
            values.push(slug);
            whereClause += `${whereClause ? " AND " : ""}p.slug = $${values.length}`;
        }

        const { rows } = await pool.query(
            `SELECT p.*, pc.name AS category_name, pc.slug AS category_slug,
                    COALESCE(images.items, '[]'::json) AS images,
                    COALESCE(stock_summary.available_stock, 0)::int AS stock,
                    COALESCE(stock_summary.total_stock, 0)::int AS total_stock,
                    COALESCE(stock_summary.reserved_stock, 0)::int AS reserved_stock,
                    COALESCE(stock_summary.stocks, '[]'::jsonb) AS stocks
             FROM product AS p
             INNER JOIN product_category AS pc ON pc.id = p.category_id AND pc.deleted_at IS NULL
             LEFT JOIN LATERAL (
                 SELECT JSON_AGG(
                     JSON_BUILD_OBJECT('url', pi.url, 'is_main', pi.is_main)
                     ORDER BY pi.is_main DESC, pi.id
                 ) AS items
                 FROM product_images AS pi
                 WHERE pi.product_id = p.id AND pi.deleted_at IS NULL
             ) AS images ON TRUE
             LEFT JOIN LATERAL (
                 SELECT
                     SUM(COALESCE(i.total_stock - i.reserved_stock, 0)) AS available_stock,
                     SUM(COALESCE(i.total_stock, 0)) AS total_stock,
                     SUM(COALESCE(i.reserved_stock, 0)) AS reserved_stock,
                     JSONB_AGG(
                         JSON_BUILD_OBJECT(
                             'variant_id', pv.id,
                             'size', pv.size,
                             'total_stock', COALESCE(i.total_stock, 0),
                             'reserved_stock', COALESCE(i.reserved_stock, 0),
                             'available_stock', GREATEST(COALESCE(i.total_stock - i.reserved_stock, 0), 0),
                             'stock', GREATEST(COALESCE(i.total_stock - i.reserved_stock, 0), 0)
                         ) ORDER BY pv.id
                     ) AS stocks
                 FROM product_variants AS pv
                 LEFT JOIN inventory AS i ON i.variant_id = pv.id
                 WHERE pv.product_id = p.id
             ) AS stock_summary ON TRUE
             WHERE ${whereClause}
               AND p.deleted_at IS NULL AND pc.deleted_at IS NULL
               ${includeAllStatuses ? "" : "AND p.status = 'active' AND pc.status = 'active'"}
             LIMIT 1`,
            values
        );

        return rows[0] ?? null;

    }

}
