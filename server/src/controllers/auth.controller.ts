import { generateVerificationToken, getHashed, verificationEmailTemplate } from "../helpers/helper.js";

import catchAsync from "../utils/catchAsync.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { NextFunction, Request, Response } from "express";
import { generateHash } from "../helpers/helper.js";
import { sendEmail } from "../helpers/mailService.js";




export const verifyRegistration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, firstName, lastName, phone } = req.body
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser && existingUser.verified) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists."
        });
    }

    const verificationToken = generateVerificationToken();
    if (existingUser && !existingUser.verified) {

        await prisma.user.update({
            where: { email },
            data: {
                verificationTokenHash: verificationToken.hashedToken,
                verificationTokenExpiresAt: verificationToken.expiresAt,
            }
        });
        try {
            const mailHtml = verificationEmailTemplate(existingUser.firstName, verificationToken.rawToken);
            await sendEmail(email, "Complete your Zenvy account verification", mailHtml);
            return res.status(200).json({
                success: true,
                message: "A verification link has been sent to your email. Please verify to continue."
            });
        } catch {
            await prisma.user.update({
                where: { email },
                data: {
                    verificationTokenHash: null,
                    verificationTokenExpiresAt: null,
                }
            });
            return next(new AppError("Failed to send verification email. Please try again.", 500));
        }

    }


    await prisma.user.create({
        data: {
            email,
            firstName,
            phone,
            lastName,
            passwordHash: await generateHash(password),
            verified: false,
            verificationTokenHash: verificationToken.hashedToken,
            verificationTokenExpiresAt: verificationToken.expiresAt,
        }
    });
    try {
        const mailHtml = verificationEmailTemplate(firstName, verificationToken.rawToken);
        await sendEmail(email, "Complete your Zenvy account verification", mailHtml);
    } catch {
        await prisma.user.delete({ where: { email } });
        return next(new AppError("Failed to send verification email. Please try again.", 500));
    }



    return res.status(201).json({
        success: true,
        message: "A verification link has been sent to your email. Please verify to continue."
    });
})

export const verifySignUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { token } = req.body
    const hashedToken = getHashed(token)
    const user = await prisma.user.findUnique({
        where: {
            verificationTokenHash: hashedToken,
        },
    });
    if (!user) return next(new AppError("Invalid token", 400))
    if (user?.verified) return res.status(200).json({ success: false, message: "Email already verified" })
    const currentTime = new Date().getTime()
    const expiryTime = user.verificationTokenExpiresAt?.getTime();
    if (currentTime > expiryTime!) return res.status(200).json({ success: false, message: "Session Expired, request for verify again" })


    const result = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            verified: true,
            verificationTokenHash: null,
            verificationTokenExpiresAt: null
        }
    })

    return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: {
            id: user.id,
            email: user.email
        }
    })
})


export const verifySignIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

})





