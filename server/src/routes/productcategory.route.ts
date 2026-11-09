import { Router } from "express";
import { z } from "zod";
import {
    AddProductCategory,
    DeleteProductCategory,
    GetAdminProductCategories,
    GetProductCategories,
    UpdateProductCategory,
} from "../controller/product_category.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.midleware.js";
import { validate } from "../middlewares/routeValidator.js";
const router = Router()
const requireAdmin = [requireAuth, requireRole("admin")];
const categorySchema = z.object({
    name: z.string().trim().min(2).max(41),
    image: z.url().max(2048).refine((value) => {
        const protocol = new URL(value).protocol;
        return protocol === "https:" || protocol === "http:";
    }, "Image URL must use HTTP or HTTPS"),
}).strict();
const categoryIdSchema = z.object({ id: z.coerce.number().int().positive() }).strict();

router.get('/admin-list', ...requireAdmin, GetAdminProductCategories);
router.post('/create', ...requireAdmin, validate(categorySchema, "body"), AddProductCategory)
router.put('/:id', ...requireAdmin, validate(categoryIdSchema, "params"), validate(categorySchema, "body"), UpdateProductCategory);
router.delete('/:id', ...requireAdmin, validate(categoryIdSchema, "params"), DeleteProductCategory);
router.get('/get-categories', GetProductCategories)

export default router