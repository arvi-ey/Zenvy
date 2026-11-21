import { Router } from "express";
import { z } from "zod";
import {
    cancelOrder,
    createOrder,
    getOrderDetails,
    getOrders,
} from "../controller/order.controller.js";
import { requireAuth } from "../middlewares/auth.midleware.js";
import { validate } from "../middlewares/routeValidator.js";

const router = Router();
const orderSchema = z.object({
    address_id: z.number().int().positive(),
    payment_method: z.literal("cod"),
    variant_ids: z.array(z.number().int().positive()).min(1).max(500).optional(),
    selected_colors: z.array(z.object({
        variant_id: z.number().int().positive(),
        selected_color: z.string().trim().min(1).max(50),
    }).strict()).max(500).optional(),
}).strict().refine(
    (value) => !value.variant_ids || new Set(value.variant_ids).size === value.variant_ids.length,
    { message: "Duplicate cart items are not allowed.", path: ["variant_ids"] }
).refine(
    (value) => !value.selected_colors ||
        new Set(value.selected_colors.map((item) => item.variant_id)).size === value.selected_colors.length,
    { message: "Duplicate selected colors are not allowed.", path: ["selected_colors"] }
);

const orderIdSchema = z.object({
    orderId: z.coerce.number().int().positive(),
}).strict();

router.use(requireAuth);
router.get("/", getOrders);
router.get("/:orderId", validate(orderIdSchema, "params"), getOrderDetails);
router.post("/:orderId/cancel", validate(orderIdSchema, "params"), cancelOrder);
router.post("/", validate(orderSchema, "body"), createOrder);

export default router;
