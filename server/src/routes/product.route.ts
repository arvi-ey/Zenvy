import { z } from "zod";
import { Router } from "express";
import { validate } from "../middlewares/routeValidator.js";
import {
    addProduct,
    bulkDeleteProducts,
    bulkUpdateProductStatus,
    deleteProduct,
    getAdminProducts,
    getProducts,
    getProductDetails,
    updateProduct,
} from "../controller/product.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.midleware.js";
const router = Router()
const requireAdmin = [requireAuth, requireRole("admin")];
export const createProductSchema = z.object({
    name: z
        .string()
        .min(1, "Title is required")
        .max(150, "Name cannot exceed 150 characters"),

    description: z
        .string()
        .min(1, "Description is required"),

    sku: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9-]+$/),

    category_id: z
        .number()
        .int("Category ID must be an integer")
        .positive("Category ID must be positive"),

    stock: z
        .number()
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative"),

    price: z
        .number()
        .min(0, "Price cannot be negative"),

    compare_at_price: z.number().min(0).nullable().optional(),
    cost_price: z.number().min(0).nullable().optional(),
    low_stock_threshold: z.number().int().min(0),
    tags: z.array(z.string().trim().min(1).max(40)).max(30),

    status: z
        .enum(["active", "inactive", "draft"]),

    images: z
        .array(z.url().refine((value) => {
            const protocol = new URL(value).protocol;
            return protocol === "https:" || protocol === "http:";
        }, "Image URLs must use HTTP or HTTPS"))
        .min(1, "At least one image is required")
}).strict();


const getProductsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
    category: z.coerce.string().optional(),
    orderBy: z.enum(["ASC", "DESC"]).optional(),
    is_featured: z.enum(["true", "false"]).optional()
}).strict();

const getProductsDetailsSchema = z
    .object({
        id: z.coerce.number().int().positive().optional(),

        slug: z.string().min(1).optional(),
    })
    .strict()
    .refine(
        (data) => data.id !== undefined || data.slug !== undefined,
        {
            message: "Either id or slug is required",
        }
    );

const productIdSchema = z.object({ id: z.coerce.number().int().positive() }).strict();
const bulkStatusSchema = z.object({
    ids: z.array(z.coerce.number().int().positive()).min(1).max(500),
    status: z.enum(["active", "inactive", "draft"]),
}).strict();


router.get('/admin-list', ...requireAdmin, getAdminProducts);
router.post('/add-product', ...requireAdmin, validate(createProductSchema, "body"), addProduct);
router.put('/:id', ...requireAdmin, validate(productIdSchema, "params"), validate(createProductSchema, "body"), updateProduct);
router.delete('/:id', ...requireAdmin, validate(productIdSchema, "params"), deleteProduct);
router.post('/bulk-status', ...requireAdmin, validate(bulkStatusSchema, "body"), bulkUpdateProductStatus);
router.post('/bulk-delete', ...requireAdmin, validate(z.object({
    ids: z.array(z.coerce.number().int().positive()).min(1).max(500),
}).strict(), "body"), bulkDeleteProducts);
router.get('/get-products', validate(getProductsQuerySchema, "query"), getProducts)
router.get('/get-product-details', validate(getProductsDetailsSchema, "query"), getProductDetails)


export default router