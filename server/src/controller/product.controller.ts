import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { AddProduct } from "../services/product.services.js";
import { ProductModel } from "../models/product.model.js";


export const addProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const response = await AddProduct(req.body)
    if (response !== null) {
        sendResponse(
            res,
            200,
            "Product added successfully",
            response
        )
    }

})
export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { limit, category, orderBy, page } = req.query
    const parsedLimit = limit ? Number(limit) : 10;
    const parsedPage = page ? Number(page) : 1;

    const offset: number = (parsedPage - 1) * parsedLimit
    const response = await ProductModel.getProducts({
        limit: parsedLimit,
        offset,
        category: category ? Number(category) : undefined,

        orderBy:
            orderBy === "DESC"
                ? "DESC"
                : "ASC"
    })
    if (response !== null) {
        sendResponse(
            res,
            200,
            "Product fetched successfully",
            response
        )
    }
})