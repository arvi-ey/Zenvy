import { is } from "zod/locales";
import { pool } from "../config/db.js";



interface GetProductsOptions {
    limit?: number;
    offset?: number;
    category?: string;
    orderBy?: "ASC" | "DESC";
    is_featured?: boolean
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
        is_featured
    }: GetProductsOptions = {}) {

        let query = `
        SELECT
            p.* ,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'url', pi.url,
                    'is_main', pi.is_main
                )
            ) AS images
        FROM product AS p
        INNER JOIN product_images AS pi
            ON p.id = pi.product_id
            INNER JOIN product_category as pc on pc.id = p.category_id
        WHERE p.deleted_at IS NULL 
    `;

        const values: (number | string | boolean)[] = [];
        let paramIndex = 0;

        if (category !== undefined && category !== "all") {
            paramIndex += 1
            query += `AND pc.slug = $${paramIndex}`;
            values.push(category);

        }

        if (is_featured !== undefined) {
            paramIndex += 1
            query += `AND p.is_featured = $${paramIndex}`
            values.push(is_featured)
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

        console.log("========== QUERY ==========");
        console.log(query);
        console.log("========== VALUES ==========");
        console.log(values);
        console.log("========== COUNT ==========", values.length);



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



