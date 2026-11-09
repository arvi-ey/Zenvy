import { pool } from "../config/db.js";
import AppError from "../utils/AppError.js";

export type OrderItemInput = {
    product_id: number;
    quantity: number;
    selected_size: string;
    selected_color: string;
};

export type CreateOrderInput = {
    address_id: number;
    payment_method: "cod";
    items: OrderItemInput[];
};

export class OrderModel {
    static async create(userId: number, input: CreateOrderInput) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const address = await client.query(
                `SELECT id FROM address WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
                [input.address_id, userId]
            );
            if (!address.rowCount) {
                throw new AppError("Delivery address not found.", 404);
            }

            const productIds = input.items.map((item) => item.product_id);
            const products = await client.query(
                `SELECT p.id, p.name, p.price, pi.url AS image,
                        pv.size AS variant_size, pv.stock AS variant_stock
                 FROM product p
                 INNER JOIN product_variants pv ON pv.product_id = p.id
                 LEFT JOIN LATERAL (
                   SELECT url FROM product_images
                   WHERE product_id = p.id AND deleted_at IS NULL
                   ORDER BY is_main DESC, id ASC LIMIT 1
                 ) pi ON true
                 WHERE p.id = ANY($1::int[]) AND p.deleted_at IS NULL AND p.status = 'active'
                 FOR UPDATE OF p, pv`,
                [productIds]
            );
            const productMap = new Map(products.rows.map((product) => [
                `${product.id}:${String(product.variant_size).toLowerCase()}`,
                product,
            ]));
            const selectedProducts = input.items.map((item) => {
                const product = productMap.get(
                    `${item.product_id}:${item.selected_size.toLowerCase()}`
                );
                if (!product) {
                    throw new AppError(
                        `The selected size for product ${item.product_id} is unavailable.`,
                        409
                    );
                }
                if (Number(product.variant_stock) < item.quantity) {
                    throw new AppError(
                        `${product.name} does not have enough stock for the selected size.`,
                        409
                    );
                }
                return product;
            });
            const subtotal = input.items.reduce((sum, item, index) => {
                const product = selectedProducts[index];
                return sum + Number(product.price) * item.quantity;
            }, 0);
            const deliveryCharge = 40;
            const order = await client.query(
                `INSERT INTO orders (user_id, address_id, payment_method, subtotal, delivery_charge, total)
                 VALUES ($1, $2, 'cod', $3, $4, $5)
                 RETURNING id, status, payment_method AS "paymentMethod", subtotal, delivery_charge AS "deliveryCharge",
                           total, created_at AS "createdAt"`,
                [userId, input.address_id, subtotal, deliveryCharge, subtotal + deliveryCharge]
            );

            for (const [index, item] of input.items.entries()) {
                const product = selectedProducts[index];
                await client.query(
                    `INSERT INTO order_items
                     (order_id, product_id, product_name, product_image, quantity, unit_price, selected_size, selected_color)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [order.rows[0].id, item.product_id, product.name, product.image ?? null, item.quantity,
                        product.price, item.selected_size, item.selected_color]
                );
                await client.query(
                    `UPDATE product_variants
                     SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
                     WHERE product_id = $2 AND lower(size) = lower($3)`,
                    [item.quantity, item.product_id, item.selected_size]
                );
            }

            await client.query(
                `DELETE FROM cart WHERE user_id = $1 AND product_id = ANY($2::int[])`,
                [userId, productIds]
            );
            await client.query("COMMIT");
            return { ...order.rows[0], items: input.items.map((item, index) => ({
                productId: item.product_id,
                name: selectedProducts[index].name,
                image: selectedProducts[index].image ?? null,
                quantity: item.quantity,
                unitPrice: Number(selectedProducts[index].price),
                selectedSize: item.selected_size,
                selectedColor: item.selected_color,
            })) };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async getByUserId(userId: number) {
        const { rows } = await pool.query(
            `SELECT id, status, payment_method AS "paymentMethod", subtotal, delivery_charge AS "deliveryCharge",
                    total, created_at AS "createdAt"
             FROM orders WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
            [userId]
        );
        for (const order of rows) {
            const items = await pool.query(
                `SELECT product_id AS "productId", product_name AS name, product_image AS image,
                        quantity, unit_price AS "unitPrice", selected_size AS "selectedSize",
                        selected_color AS "selectedColor"
                 FROM order_items WHERE order_id = $1 ORDER BY id`,
                [order.id]
            );
            order.items = items.rows;
        }
        return rows;
    }
}
