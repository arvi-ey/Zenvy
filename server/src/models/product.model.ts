import { pool } from "../config/db.js";



interface GetProductsOptions {
    limit?: number;
    offset?: number;
    category?: number;
    orderBy?: "ASC" | "DESC";
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
        orderBy = "ASC"
    }: GetProductsOptions = {}) {

        let query = `
        SELECT
            p.*,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'url', pi.url,
                    'is_main', pi.is_main
                )
            ) AS images
        FROM product AS p
        INNER JOIN product_images AS pi
            ON p.id = pi.product_id
        WHERE p.deleted_at IS NULL
    `;

        const values: (number)[] = [];
        let paramIndex = 0;

        if (category !== undefined) {
            paramIndex += 1
            query += ` AND p.category_id = $${paramIndex}`;
            values.push(category);

        }

        query += ` GROUP BY p.id`;

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



    static async getproductdetails({ id, slug }: getProductdetailsOption = {}) {

        let query = `
        SELECT p.*, JSON_AGG(JSON_BUILD_OBJECT(
        'url',pi.url,
        'is_main',pi.is_main
        )) AS images FROM product AS p
        INNER JOIN product_images AS pi ON p.id = pi.product_id`
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
        query += ` GROUP BY p.id;`
        const { rows } = await pool.query(query, values)

        return rows[0] ?? null;

    }

}



