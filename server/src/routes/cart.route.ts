import { Router } from "express";
import { z } from "zod";
import { addToCart, deleteFromCart, getCart } from "../controller/cart.controller.js";
import { ensureGuestToken } from "../middlewares/cart.middleware.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.midleware.js";
import { validate } from "../middlewares/routeValidator.js";

const router = Router();

router.get("/get-cart", optionalAuth, ensureGuestToken, getCart);
router.delete(
    "/delete-cart/:productId",
    optionalAuth,
    validate(
        z.object({ productId: z.coerce.number().int().positive() }).strict(),
        "params"
    ),
    ensureGuestToken,
    deleteFromCart
);

const addToCartSchema = z
    .object({
        product_id: z.coerce.number().int().positive(),
        product_count: z.coerce.number().int().min(1).max(10),
    })
    .strict();

router.post(
    "/add-to-cart",
    requireAuth,
    validate(addToCartSchema, "body"),
    addToCart
);

export default router;
