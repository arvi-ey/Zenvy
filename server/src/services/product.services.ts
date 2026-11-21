import { pool } from "../config/db.js";
import { randomBytes } from "node:crypto";

interface ProductImage {
    url: string;
    id?: number;
    is_main: boolean;
}

interface ProductData {
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
    status: 'active' | 'inactive' | 'draft';
    images: ProductImage[];
}

export const AddProduct = async (data: ProductData) => {

    const client = await pool.connect();

    try {
        const { images, variants, stock, ...productData } = data;
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

        const productResult = await client.query(
            productQuery,
            values
        );

        const product = productResult.rows[0];

        const inventoryVariants = variants ?? (stock === undefined
            ? []
            : [{ size: "FREE", total_stock: stock }]);
        for (const variant of inventoryVariants) {
            const variantResult = await client.query(
                `INSERT INTO product_variants (product_id, size)
                 VALUES ($1, $2)
                 ON CONFLICT (product_id, size) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                 RETURNING id`,
                [product.id, variant.size]
            );
            await client.query(
                `INSERT INTO inventory (variant_id, total_stock)
                 VALUES ($1, $2)
                 ON CONFLICT (variant_id) DO UPDATE
                 SET total_stock = EXCLUDED.total_stock,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE inventory.reserved_stock <= EXCLUDED.total_stock`,
                [variantResult.rows[0].id, variant.total_stock]
            );
        }

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

            await client.query(
                imageQuery,
                [
                    images[i].url,
                    product.id,
                    images[i].is_main
                ]
            );
        }

        await client.query("COMMIT");

        return product;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};