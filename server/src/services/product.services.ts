import { pool } from "../config/db.js";



interface ProductData {
    name: string,
    description: string,
    category_id: number,
    stock: number,
    price: number,
    status: 'active' | 'inactive' | 'draft',
    images: string[]
}
export const AddProduct = async (data: ProductData) => {
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const { images, ...productData } = data
        const columns = Object.keys(productData);
        const values = Object.values(productData);
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
        for (let i = 0; i < images.length; i++) {

            const imageQuery = `
                INSERT INTO product_images
                (
                    url,
                    product_id,
                    is_main
                )
                VALUES
                ($1, $2, $3);
            `;


            await client.query(
                imageQuery,
                [
                    images[i],
                    product.id,
                    i === 0
                ]
            );
        }

        await client.query("COMMIT");
        return product
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error
    }
    finally {
        client.release();
    }
}