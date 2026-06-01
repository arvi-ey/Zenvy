import crypto from "crypto";
import { generateVerificationToken, verificationEmailTemplate } from "../helpers/helper.js";

import catchAsync from "../utils/catchAsync.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { NextFunction, Request, Response } from "express";
import { generateHash } from "../helpers/helper.js";
import { sendEmail } from "../helpers/mailService.js";




export const verifyRegistration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, firstName, lastName } = req.body
    const payload: any = {}
    payload.passwordHash = await generateHash(password)
    payload.email = email
    payload.firstName = firstName
    payload.lastName = lastName
    payload.verified = false
    payload.verificationTokenHash = generateVerificationToken().hashedToken
    payload.verificationTokenExpiresAt = generateVerificationToken().expiresAt

    const mailhtml = verificationEmailTemplate(firstName, generateVerificationToken().rawToken)
    await sendEmail(email, "Complete your Zenvy account verification", mailhtml)

    res.status(200).json({
        success: true,
        message: "Request for verification"
    })

})





