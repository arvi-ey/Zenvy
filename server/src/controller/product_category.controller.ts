import { ProductCategoryModel } from "../models/product_category.model.js";
import catchAsync from "../utils/catchAsync.js";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response.js";

export const AddProductCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { name } = req.body
    const response = await ProductCategoryModel.create(name)
    if (response !== null) {
        sendResponse(
            res,
            200,
            "Product category added",
            response
        )
    }
})