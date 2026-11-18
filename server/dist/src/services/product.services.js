import { pool } from "../config/db.js";
import { randomBytes } from "node:crypto";
export const AddProduct = async (data) => {
    const client = await pool.connect();
    try {
        const { images, ...productData } = data;
        const normalizedSlug = productData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "product";
        const productDataWithSlug = {
            ...productData,
            slug: `${normalizedSlug}-${randomBytes(4).toString("hex")}`,
        };
        await client.query("BEGIN");
        const columns = Object.keys(productDataWithSlug);
        const values = Object.values(productDataWithSlug);
        const placeholders = values
            .map((_, index) => `$${index + 1}`)
            .join(",");
        const productQuery = `
            INSERT INTO product
            (${columns.join(", ")})
            VALUES
            (${placeholders})
            RETURNING *;
        `;
        const productResult = await client.query(productQuery, values);
        const product = productResult.rows[0];
        for (let i = 0; i < images.length; i++) {
            const imageQuery = `
                INSERT INTO product_images
                (
                    url,
                    product_id,
                    is_main
                )
                VALUES ($1, $2, $3);
            `;
            await client.query(imageQuery, [
                images[i].url,
                product.id,
                images[i].is_main
            ]);
        }
        await client.query("COMMIT");
        return product;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
