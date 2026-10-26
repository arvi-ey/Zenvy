import type { Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import { AddressModel } from "../models/address.model.js";

export const getAddresses = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Authentication is required", 401);
    }

    const addresses = await AddressModel.getByUserId(userId);
    sendResponse(res, 200, "Addresses fetched successfully", addresses);
});

export const createAddress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Authentication is required", 401);
    }

    const address = await AddressModel.create(userId, req.body);
    sendResponse(res, 201, "Address created successfully", address);
});

export const deleteAddress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const addressId = Number(req.params.addressId);
    if (!userId) {
        throw new AppError("Authentication is required", 401);
    }
    if (!Number.isSafeInteger(addressId) || addressId <= 0) {
        throw new AppError("Invalid address", 400);
    }

    const deleted = await AddressModel.delete(userId, addressId);
    if (!deleted) {
        throw new AppError("Address not found", 404);
    }

    sendResponse(res, 200, "Address deleted successfully");
});
