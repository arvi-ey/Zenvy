import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { CartModel } from "../models/cart.model.js";
import AppError from "../utils/AppError.js";

export const getCart = catchAsync(
    async (req: Request, res: Response) => {
        const user_id = req.user?.id;
        const guest_token = req.guest_token;

        if (!user_id && !guest_token) {
            throw new AppError("Either user or guest session is required", 400);
        }

        const response = await CartModel.getCart({ user_id, guest_token });
        sendResponse(res, 200, "Cart fetched successfully", response);
    }
);

export const deleteFromCart = catchAsync(
    async (req: Request, res: Response) => {
        const user_id = req.user?.id;
        const guest_token = req.guest_token;
        const product_id = Number(req.params.productId);

        if (!user_id && !guest_token) {
            throw new AppError("Either user or guest session is required", 400);
        }
        if (!Number.isSafeInteger(product_id) || product_id <= 0) {
            throw new AppError("Invalid product", 400);
        }

        await CartModel.deleteFromCart({ product_id, user_id, guest_token });
        sendResponse(res, 200, "Item removed from cart");
    }
);

export const addToCart = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const user_id = req.user?.id;
        const guest_token = req.guest_token;
        const { product_id, product_count } = req.body;

        if (!user_id && !guest_token) {
            throw new AppError("Either user or guest session is required", 400);
        }

        const productId = Number(product_id);
        const productCount = Number(product_count);

        if (!Number.isInteger(productId) || productId <= 0) {
            throw new AppError("Invalid product", 400);
        }
        if (!Number.isInteger(productCount) || productCount < 1 || productCount > 10) {
            throw new AppError("Invalid product count", 400);
        }

        const response = await CartModel.addToCart({
            product_id: productId,
            product_count: productCount,
            user_id,
            guest_token,
        });

        sendResponse(res, 200, "Item added to cart", response);
    }
);