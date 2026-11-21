import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { AddProduct } from "../services/product.services.js";
import { ProductModel } from "../models/product.model.js";
import AppError from "../utils/AppError.js";

interface AdminProductInput {
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
    status: "active" | "inactive" | "draft";
    images: string[];
}

function normalizeProductInput(data: AdminProductInput) {
    return {
        ...data,
        name: data.name.trim(),
        description: data.description.trim(),
        sku: data.sku.trim().toUpperCase(),
        tags: data.tags.map((tag) => tag.trim()),
        images: data.images.map((url, index) => ({ url, is_main: index === 0 })),
    };
}




export const addProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const body = req.body as AdminProductInput;
    const response = await AddProduct(normalizeProductInput(body));
    if (response !== null) {
        const product = await ProductModel.getproductdetails({
            id: response.id,
            includeAllStatuses: true,
        });
        sendResponse(
            res,
            200,
            "Product added successfully",
            product
        )
    }

    // for (let index in Demodata) {
    //     const response = await AddProduct(Demodata[index])
    // }
    // res.send("DATA SUCCESS")

})

export const getAdminProducts = catchAsync(async (_req: Request, res: Response) => {
    const products = await ProductModel.getAdminProducts();
    sendResponse(res, 200, "Admin products fetched successfully", products);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const normalized = normalizeProductInput(req.body as AdminProductInput);
    const response = await ProductModel.update(id, {
        ...normalized,
        images: req.body.images as string[],
    });
    if (!response) {
        throw new AppError("Product not found.", 404);
    }
    const updatedProduct = await ProductModel.getproductdetails({
        id,
        includeAllStatuses: true,
    });
    sendResponse(res, 200, "Product updated successfully", updatedProduct);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const deleted = await ProductModel.delete(Number(req.params.id));
    if (!deleted) {
        throw new AppError("Product not found.", 404);
    }
    sendResponse(res, 200, "Product deleted successfully");
});

export const bulkUpdateProductStatus = catchAsync(async (req: Request, res: Response) => {
    const { ids, status } = req.body as { ids: number[]; status: "active" | "inactive" | "draft" };
    const count = await ProductModel.bulkUpdateStatus(ids, status);
    sendResponse(res, 200, "Products updated successfully", { count });
});

export const bulkDeleteProducts = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body as { ids: number[] };
    const count = await ProductModel.bulkDelete(ids);
    sendResponse(res, 200, "Products deleted successfully", { count });
});
export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { limit, category, orderBy, page, is_featured } = req.query
    const parsedLimit = limit ? Number(limit) : 10;
    const parsedPage = page ? Number(page) : 1;

    const offset: number = (parsedPage - 1) * parsedLimit
    const parsedCategory =
        typeof category === "string"
            ? category
            : undefined;
    const parsedFeatured = is_featured == "true" ? true : undefined

    const response = await ProductModel.getProducts({
        limit: parsedLimit,
        offset,
        category: parsedCategory,
        orderBy:
            orderBy === "DESC"
                ? "DESC"
                : "ASC",
        is_featured: parsedFeatured
    })
    if (response?.length === 0) {
        return sendResponse(
            res,
            200,
            "No products found",
            []
        )
    }

    sendResponse(
        res,
        200,
        "Product fetched successfully",
        response
    )
})


export const getProductDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { id, slug } = req.query
    const parsedId = id ? Number(id) : undefined
    const parsedSlug = typeof slug === "string"
        ? slug
        : undefined;
    const response = await ProductModel.getproductdetails({ id: parsedId, slug: parsedSlug })
    if (response == null) {
        return sendResponse(
            res,
            200,
            "No product found",
            response
        )
    }

    sendResponse(
        res,
        200,
        "Product fetched successfully",
        response
    )
})
