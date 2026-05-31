import { Jwt } from "jsonwebtoken";
import { randomInt } from "node:crypto";

import catchAsync from "../utils/catchAsync.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { NextFunction, Request, Response } from "express";
import { generateHash } from "../helpers/helper.js";



export const verifyRegistration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    const payload: any = {}
    payload.passwordHash = generateHash(password)

})