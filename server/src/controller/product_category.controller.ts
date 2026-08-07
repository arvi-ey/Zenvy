import { ProductCategoryModel } from "../models/product_category.model.js";
import catchAsync from "../utils/catchAsync.js";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response.js";

export const AddProductCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { name, image } = req.body
    const response = await ProductCategoryModel.create(name, image)
    if (response !== null) {
        sendResponse(
            res,
            200,
            "Product category added",
            response
        )
    }
})

export const GetProductCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let status: 'active' | 'inactive' | 'all' | null = null
    if (
        req.query.status === 'active' ||
        req.query.status === 'inactive' ||
        req.query.status === 'all'
    ) {
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