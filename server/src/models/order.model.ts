import { pool } from "../config/db.js";
import AppError from "../utils/AppError.js";

export type CreateOrderInput = {
    address_id: number;
    payment_method: "cod";
    variant_ids?: number[];
    selected_colors?: { variant_id: number; selected_color: string }[];
};

const DELIVERY_CHARGE_CENTS = 4000n;

function priceToCents(price: string | number): bigint {
    const [whole, fraction = ""] = String(price).split(".");
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2));
}

function centsToAmount(cents: bigint): number {
    return Number(cents) / 100;
}

export class OrderModel {
    static async create(userId: number, input: CreateOrderInput) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const address = await client.query(
                `SELECT id
                 FROM address
                 WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
                 FOR UPDATE`,
                [input.address_id, userId]
            );
            if (!address.rowCount) {
                throw new AppError("Delivery address not found.", 404);
            }

            if (input.variant_ids && (
                input.variant_ids.length === 0 ||
                new Set(input.variant_ids).size !== input.variant_ids.length
            )) {
                throw new AppError("Select valid cart items to checkout.", 400);
            }
            if (input.selected_colors && (
                new Set(input.selected_colors.map((item) => item.variant_id)).size !== input.selected_colors.length
            )) {
                throw new AppError("Selected colors must be unique per variant.", 400);
            }

            const cartResult = await client.query(
                `SELECT
                    c.id AS cart_id,
                    c.product_id,
                    c.variant_id,
                    c.product_count AS quantity,
                    p.name AS product_name,
                    p.price,
                    pv.size AS selected_size,
                    image.url AS product_image
                 FROM cart AS c
                 INNER JOIN product AS p ON p.id = c.product_id
                 INNER JOIN product_variants AS pv
                    ON pv.id = c.variant_id AND pv.product_id = p.id
                 LEFT JOIN LATERAL (
                    SELECT url
                    FROM product_images
                    WHERE product_id = p.id AND deleted_at IS NULL
                    ORDER BY is_main DESC, id ASC
                    LIMIT 1
                 ) AS image ON TRUE
                 WHERE c.user_id = $1
                   AND c.deleted_at IS NULL
                   AND p.deleted_at IS NULL
                   AND p.status = 'active'
                   AND ($2::int[] IS NULL OR c.variant_id = ANY($2::int[]))
                 ORDER BY c.variant_id, c.id
                 FOR UPDATE OF c, p, pv`,
                [userId, input.variant_ids ?? null]
            );
            const cartItems = cartResult.rows;
            if (cartItems.length === 0) {
                throw new AppError("Your cart is empty or the selected items are unavailable.", 409);
            }
            if (input.variant_ids && input.variant_ids.some(
                (variantId) => !cartItems.some((item) => Number(item.variant_id) === variantId)
            )) {
                throw new AppError("One or more selected items are no longer in your cart.", 409);
            }
            const selectedColors = new Map(
                (input.selected_colors ?? []).map((item) => [item.variant_id, item.selected_color])
            );
            if (input.selected_colors && (
                input.selected_colors.length !== cartItems.length ||
                cartItems.some((item) => !selectedColors.has(Number(item.variant_id)))
            )) {
                throw new AppError("Selected colors do not match the cart items.", 400);
            }

            const variantIds = cartItems.map((item) => Number(item.variant_id));
            const inventoryResult = await client.query(
                `SELECT variant_id, total_stock, reserved_stock
                 FROM inventory
                 WHERE variant_id = ANY($1::int[])
                 ORDER BY variant_id
                 FOR UPDATE`,
                [variantIds]
            );
            const inventoryByVariant = new Map(
                inventoryResult.rows.map((item) => [Number(item.variant_id), item])
            );

            let subtotalCents = 0n;
            for (const item of cartItems) {
                const inventory = inventoryByVariant.get(Number(item.variant_id));
                if (!inventory) {
                    throw new AppError(
                        `Inventory for ${item.product_name} (${item.selected_size}) is unavailable.`,
                        409
                    );
                }
                const availableStock = Number(inventory.total_stock) - Number(inventory.reserved_stock);
                if (availableStock < Number(item.quantity)) {
                    throw new AppError(
                        `${item.product_name} does not have enough stock for size ${item.selected_size}.`,
                        409
                    );
                }
                subtotalCents += priceToCents(item.price) * BigInt(item.quantity);
            }

            const totalCents = subtotalCents + DELIVERY_CHARGE_CENTS;
            const subtotal = centsToAmount(subtotalCents);
            const deliveryCharge = centsToAmount(DELIVERY_CHARGE_CENTS);
            const total = centsToAmount(totalCents);
            const orderResult = await client.query(
                `INSERT INTO orders
                    (user_id, address_id, payment_method, subtotal, delivery_charge, total)
                 VALUES ($1, $2, 'cod', $3, $4, $5)
                 RETURNING id, status, payment_method AS "paymentMethod",
                           subtotal::float8 AS subtotal,
                           delivery_charge::float8 AS "deliveryCharge",
                           total::float8 AS total,
                           created_at AS "createdAt"`,
                [userId, input.address_id, subtotal, deliveryCharge, total]
            );
            const order = orderResult.rows[0];

            for (const item of cartItems) {
                await client.query(
                    `INSERT INTO order_items
                        (order_id, product_id, variant_id, product_name, product_image,
                         quantity, unit_price, selected_size, selected_color)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        order.id,
                        item.product_id,
                        item.variant_id,
                        item.product_name,
                        item.product_image,
                        item.quantity,
                        item.price,
                        item.selected_size,
                        selectedColors.get(Number(item.variant_id)) ?? "Black",
                    ]
                );

                const inventoryUpdate = await client.query(
                    `UPDATE inventory
                     SET total_stock = total_stock - $1,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE variant_id = $2
                       AND total_stock - reserved_stock >= $1`,
                    [item.quantity, item.variant_id]
                );
                if (!inventoryUpdate.rowCount) {
                    throw new AppError(
                        `${item.product_name} does not have enough stock for size ${item.selected_size}.`,
                        409
                    );
                }
            }

            const cartIds = cartItems.map((item) => Number(item.cart_id));
            const clearCartResult = await client.query(
                `UPDATE cart
                 SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $1 AND id = ANY($2::int[]) AND deleted_at IS NULL
                 RETURNING id`,
                [userId, cartIds]
            );
            if (clearCartResult.rowCount !== cartIds.length) {
                throw new AppError("Your cart changed during checkout. Please try again.", 409);
            }

            await client.query("COMMIT");
            return {
                ...order,
                subtotal,
                deliveryCharge,
                total,
                items: cartItems.map((item) => ({
                    productId: Number(item.product_id),
                    variantId: Number(item.variant_id),
                    name: item.product_name,
                    image: item.product_image ?? null,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.price),
                    selectedSize: item.selected_size,
                    selectedColor: selectedColors.get(Number(item.variant_id)) ?? "Black",
                })),
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async getByUserId(userId: number) {
        const { rows } = await pool.query(
            `SELECT id, status, payment_method AS "paymentMethod",
                    subtotal::float8 AS subtotal,
                    delivery_charge::float8 AS "deliveryCharge",
                    total::float8 AS total,
                    created_at AS "createdAt"
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC, id DESC`,
            [userId]
        );
        for (const order of rows) {
            const items = await pool.query(
                `SELECT id, product_id AS "productId", variant_id AS "variantId",
                        product_name AS name, product_image AS image,
                        quantity, unit_price::float8 AS "unitPrice",
                        selected_size AS "selectedSize", selected_color AS "selectedColor"
                 FROM order_items
                 WHERE order_id = $1
                 ORDER BY id`,
                [order.id]
            );
            order.items = items.rows;
        }
        return rows;
    }

    static async getById(userId: number, orderId: number) {
        const { rows } = await pool.query(
            `SELECT o.id, o.status, o.payment_method AS "paymentMethod",
                    o.subtotal::float8 AS subtotal,
                    o.delivery_charge::float8 AS "deliveryCharge",
                    o.total::float8 AS total,
                    o.created_at AS "createdAt",
                    json_build_object(
                        'street', a.street,
                        'landmark', a.landmark,
                        'district', a.district,
                        'state', a.state,
                        'pincode', a.pincode,
                        'type', a.type
                    ) AS address
             FROM orders AS o
             INNER JOIN address AS a ON a.id = o.address_id
             WHERE o.id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );
        if (!rows.length) {
            return null;
        }

        const items = await pool.query(
            `SELECT id, product_id AS "productId", variant_id AS "variantId",
                    product_name AS name, product_image AS image,
                    quantity, unit_price::float8 AS "unitPrice",
                    selected_size AS "selectedSize", selected_color AS "selectedColor"
             FROM order_items
             WHERE order_id = $1
             ORDER BY id`,
            [orderId]
        );
        rows[0].items = items.rows;
        return rows[0];
    }

    static async cancelByUserId(userId: number, orderId: number) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const orderResult = await client.query(
                `SELECT o.id, o.status,
                        json_build_object(
                            'street', a.street,
                            'landmark', a.landmark,
                            'district', a.district,
                            'state', a.state,
                            'pincode', a.pincode,
                            'type', a.type
                        ) AS address
                 FROM orders AS o
                 INNER JOIN address AS a ON a.id = o.address_id
                 WHERE o.id = $1 AND o.user_id = $2
                 FOR UPDATE OF o`,
                [orderId, userId]
            );
            if (!orderResult.rowCount) {
                throw new AppError("Order not found.", 404);
            }
            if (orderResult.rows[0].status !== "placed") {
                throw new AppError("Only placed orders can be cancelled.", 409);
            }

            const orderItems = await client.query(
                `SELECT variant_id, SUM(quantity)::int AS quantity
                 FROM order_items
                 WHERE order_id = $1
                 GROUP BY variant_id
                 ORDER BY variant_id`,
                [orderId]
            );
            const variantIds = orderItems.rows.map((item) => Number(item.variant_id));
            const inventoryResult = await client.query(
                `SELECT variant_id
                 FROM inventory
                 WHERE variant_id = ANY($1::int[])
                 ORDER BY variant_id
                 FOR UPDATE`,
                [variantIds]
            );
            if (inventoryResult.rows.length !== variantIds.length) {
                throw new AppError("Inventory is unavailable; this order cannot be cancelled safely.", 409);
            }

            for (const item of orderItems.rows) {
                const restored = await client.query(
                    `UPDATE inventory
                     SET total_stock = total_stock + $1,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE variant_id = $2
                     RETURNING variant_id`,
                    [item.quantity, item.variant_id]
                );
                if (!restored.rowCount) {
                    throw new AppError("Inventory is unavailable; this order cannot be cancelled safely.", 409);
                }
            }

            const cancelledOrder = await client.query(
                `UPDATE orders
                 SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 AND user_id = $2 AND status = 'placed'
                 RETURNING id, status, payment_method AS "paymentMethod",
                           subtotal::float8 AS subtotal,
                           delivery_charge::float8 AS "deliveryCharge",
                           total::float8 AS total,
                           created_at AS "createdAt"`,
                [orderId, userId]
            );
            if (!cancelledOrder.rowCount) {
                throw new AppError("This order can no longer be cancelled.", 409);
            }

            const orderItemsResult = await client.query(
                `SELECT id, product_id AS "productId", variant_id AS "variantId",
                        product_name AS name, product_image AS image,
                        quantity, unit_price::float8 AS "unitPrice",
                        selected_size AS "selectedSize", selected_color AS "selectedColor"
                 FROM order_items
                 WHERE order_id = $1
                 ORDER BY id`,
                [orderId]
            );
            await client.query("COMMIT");
            return {
                ...cancelledOrder.rows[0],
                address: orderResult.rows[0].address,
                items: orderItemsResult.rows,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
