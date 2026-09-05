import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { AddProduct } from "../services/product.services.js";
import { ProductModel } from "../models/product.model.js";
import AppError from "../utils/AppError.js";




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

    // for (let index in demoProducts) {
    //     const response = await AddProduct(demoProducts[index])
    // }
    // res.send("DATA SUCCESS")

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




// {

//     "name": "OFFICIAL LOONEY TUNES MERCHANDISE",
//         "description": "Men's Gardenia Who Cares Graphic Printed Oversized T-shirt",
//             "category_id": 21,
//                 "stock": 110,
//                     "price": 899,
//                         "status": "active",

//                             "images": [
//                                 {
//                                     "url": "https://images.bewakoof.com/t1080/men-s-gardenia-who-cares-graphic-printed-oversized-t-shirt-646664-1731329946-1.jpg",
//                                     "is_main": true
//                                 },
//                                 {
//                                     "url": "https://images.bewakoof.com/t1080/men-s-gardenia-who-cares-graphic-printed-oversized-t-shirt-646664-1731329951-2.jpg",
//                                     "is_main": false
//                                 },
//                                 {
//                                     "url": "https://images.bewakoof.com/t1080/men-s-gardenia-who-cares-graphic-printed-oversized-t-shirt-646664-1731329968-6.jpg",
//                                     "is_main": false
//                                 }
//                             ]
// }