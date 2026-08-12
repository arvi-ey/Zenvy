import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { AddProduct } from "../services/product.services.js";


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
const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction))