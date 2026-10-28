import { Router } from "express";
import { z } from "zod";
import { createOrder, getOrders } from "../controller/order.controller.js";
import { requireAuth } from "../middlewares/auth.midleware.js";
import { validate } from "../middlewares/routeValidator.js";

const router = Router();
const orderSchema = z.object({
    address_id: z.number().int().positive(),
    payment_method: z.literal("cod"),
    items: z.array(z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(10),
        selected_size: z.string().trim().min(1).max(20),
        selected_color: z.string().trim().min(1).max(50),
    }).strict()).min(1),
}).strict();

router.use(requireAuth);
router.get("/", getOrders);
router.post("/", validate(orderSchema, "body"), createOrder);

export default router;
