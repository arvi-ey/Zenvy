import { z } from "zod";
import { Router } from "express";
import { validate } from "../middlewares/routeValidator.js";
import { addProduct, getProducts, getProductDetails } from "../controller/product.controller.js";
const router = Router()
export const createProductSchema = z.object({
    name: z
        .string()
        .min(1, "Title is required")
        .max(150, "Name cannot exceed 150 characters"),

    description: z
        .string()
        .min(1, "Description is required"),

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

    status: z
        .enum(["active", "inactive", "draft"]),

    images: z
        .array(z.string().min(1))
        .min(1, "At least one image is required")
}).strict();


const getProductsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
    category: z.coerce.number().int().positive().optional(),
    orderBy: z.enum(["ASC", "DESC"]).optional()
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

router.post('/add-product', validate(createProductSchema, "body"), addProduct)
router.get('/get-products', validate(getProductsQuerySchema, "query"), getProducts)
router.get('/get-product-details', validate(getProductsDetailsSchema, "query"), getProductDetails)


export default router