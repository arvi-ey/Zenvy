import { ProductCategoryModel } from "../models/product_category.model.js";
import catchAsync from "../utils/catchAsync.js";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";

export const AddProductCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { name, image } = req.body
    const response = await ProductCategoryModel.create(name.trim(), image)
    sendResponse(res, 201, "Product category added", response)
})

export const GetProductCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let status: 'active' | 'inactive' | 'all' | null = 'active'
    if (req.user?.role === "admin" && (
        req.query.status === 'active' ||
        req.query.status === 'inactive' ||
        req.query.status === 'all'
    )) {
        status = req.query.status;
    }

    const response = await ProductCategoryModel.findAll(status)

    if (response !== null) {
        sendResponse(
            res,
            200,
            "Fetched all category",
            response
        )
    }


})

export const GetAdminProductCategories = catchAsync(async (_req: Request, res: Response) => {
    const categories = await ProductCategoryModel.getAdminList();
    sendResponse(res, 200, "Admin categories fetched successfully", categories);
});

export const UpdateProductCategory = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, image } = req.body as { name: string; image: string };
    const category = await ProductCategoryModel.update(id, name.trim(), image);
    if (!category) {
        throw new AppError("Category not found.", 404);
    }
    sendResponse(res, 200, "Product category updated successfully", category);
});

export const DeleteProductCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductCategoryModel.delete(Number(req.params.id));
    if (result === "in_use") {
        throw new AppError("Delete the category's products before deleting this category.", 409);
    }
    if (result === "not_found") {
        throw new AppError("Category not found.", 404);
    }
    sendResponse(res, 200, "Product category deleted successfully");
});