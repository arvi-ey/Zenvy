
import { pool } from "../config/db.js";



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
    id?: number | undefined
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
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'url', pi.url,
                    'is_main', pi.is_main
                )
            ) AS images
        FROM product AS p
        INNER JOIN product_images AS pi
            ON p.id = pi.product_id AND pi.deleted_at IS NULL
            INNER JOIN product_category as pc on pc.id = p.category_id
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

        query += ` GROUP BY p.id, pc.name`;

        const order = orderBy === "DESC" ? "DESC" : "ASC";

        query += ` ORDER BY p.price ${order}`;


        if (limit !== undefined && limit > 0) {
            paramIndex += 1
            query += ` LIMIT $${paramIndex}`;
            values.push(limit);

        }

        if (offset !== undefined && offset >= 0) {
            paramIndex += 1
            query += ` OFFSET $${paramIndex}`;
            values.push(offset);

        }

        query += `;`;





        const { rows } = await pool.query(query, values);

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
            stock: number;
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
                 SET name = $1, description = $2, sku = $3, category_id = $4, stock = $5, price = $6,
                     compare_at_price = $7, cost_price = $8, low_stock_threshold = $9, tags = $10, status = $11
                 WHERE id = $12 AND deleted_at IS NULL
                 RETURNING *`,
                [
                    data.name,
                    data.description,
                    data.sku,
                    data.category_id,
                    data.stock,
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


    static async getproductdetails({ id, slug }: getProductdetailsOption = {}) {

        let query = `
        SELECT p.*,pc.name AS category_name, pc.slug AS category_slug, JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
        'url',pi.url,
        'is_main',pi.is_main
        )) AS images ,
         JSON_AGG(
         DISTINCT JSONB_BUILD_OBJECT(
        'size',pv.size,
        'stock',pv.stock 
        )) AS stocks FROM product AS p
        INNER JOIN product_images AS pi ON p.id = pi.product_id AND pi.deleted_at IS NULL
        INNER JOIN product_category as pc ON p.category_id = pc.id AND pc.deleted_at IS NULL
        INNER JOIN product_variants as pv ON p.id = pv.product_id
        `
        let num = 1
        let values = []

        if (id && slug == undefined) {
            query += ` WHERE p.id =$${num}`
            values.push(id)
        }
        if (slug && id == undefined) {
            query += ` WHERE p.slug =$${num}`
            values.push(slug)
        }
        if (id && slug) {
            query += ` WHERE p.slug =$${num}`
            values.push(slug)
            num += 1
            query += ` AND p.id =$${num}`
            values.push(id)
        }
        query += ` AND p.status = 'active' AND pc.status = 'active'`;
        query += ` GROUP BY p.id, pc.name, pc.slug;`
        const { rows } = await pool.query(query, values)
        console.log(rows)

        return rows[0] ?? null;

    }

}
