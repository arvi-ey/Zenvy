import type { Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { sendResponse } from "../utils/response.js";
import { OrderModel } from "../models/order.model.js";

export const createOrder = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Authentication is required", 401);
    const order = await OrderModel.create(userId, req.body);
    sendResponse(res, 201, "Cash on delivery order placed successfully", order);
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Authentication is required", 401);
    sendResponse(res, 200, "Orders fetched successfully", await OrderModel.getByUserId(userId));
});
