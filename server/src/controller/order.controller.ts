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

export const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Authentication is required", 401);
    const order = await OrderModel.getById(userId, Number(req.params.orderId));
    if (!order) throw new AppError("Order not found.", 404);
    sendResponse(res, 200, "Order fetched successfully", order);
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Authentication is required", 401);
    const order = await OrderModel.cancelByUserId(userId, Number(req.params.orderId));
    sendResponse(res, 200, "Order cancelled successfully", order);
});
