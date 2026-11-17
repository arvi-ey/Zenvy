import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { AuthModel } from "../models/auth.model.js";
import { TokenUtils } from "../utils/token.js";
import { Mailer } from "../utils/mailer.js";
import AppError from "../utils/AppError.js";
import { handleUserRegistration, SignupInput } from "../services/auth.services.js";

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as SignupInput;

    const existingUser = await AuthModel.findByEmail(body.email);

    if (existingUser) {
      
        if (existingUser.status === "suspended") {
            throw new AppError("Your account has been suspended. Please contact support.", 403);
        }

        
        if (existingUser.verified) {
            throw new AppError("Email is already registered. Please sign in.", 400);
        }

        // const verificationExpiresAt = existingUser.verification_token_expires_at;
        // if (verificationExpiresAt && new Date(verificationExpiresAt).getTime() > Date.now()) {
        //     return sendResponse(
        //         res,
        //         200,
        //         "A verification email has already been sent. Please check your inbox and use that email to verify your account. You can request a new email after it expires.",
        //         { userId: existingUser.id }
        //     );
        // }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24);

        await AuthModel.updateVerificationToken(existingUser.id, verificationToken, tokenExpiry);
        await Mailer.sendVerificationEmail(body.email, verificationToken, existingUser.first_name);

        return sendResponse(
            res,
            200,
            "Account already exists but is unverified. We have sent a new verification link to your email.",
            { userId: existingUser.id }
        );
    }

    const { user, isNew } = await handleUserRegistration(body);

    sendResponse(
        res,
        201,
        "Registration successful. Please check your email to verify your account before signing in.",
        { userId: user.id }
    );
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body; 
    if (!token) {
        throw new AppError("Verification token is required", 400);
    }

    const user = await AuthModel.findByVerificationToken(token);
    if (!user) {
        throw new AppError("Invalid verification token.", 400);
    }

    if (
        !user.verification_token_expires_at ||
        new Date(user.verification_token_expires_at).getTime() <= Date.now()
    ) {
        throw new AppError("Verification link has expired. Request a new one.", 410);
    }

    if (user.verified) {
        throw new AppError("Account is already verified. You can sign in.", 400);
    }

    await AuthModel.verifyUserAccount(user.id);

   
    const accessToken = TokenUtils.generateAccessToken({
        userId: user.id,
        role: user.user_type,
    });

    
    const rawRefreshToken = TokenUtils.generateRefreshToken();
    const tokenHash = TokenUtils.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    const maxExpiryDate = new Date();
    maxExpiryDate.setDate(maxExpiryDate.getDate() + 30); 

   
    await AuthModel.createSession({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        max_expiry_date: maxExpiryDate,
    });

  
    sendResponse(res, 200, "Email verified successfully! Welcome to the platform.", {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            user_type: user.user_type,
        },
    });
});

export const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await AuthModel.findByEmail(email);

    if (user && !user.verified && user.status !== "suspended") {
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24);

        await AuthModel.updateVerificationToken(user.id, verificationToken, tokenExpiry);
        await Mailer.sendVerificationEmail(user.email, verificationToken, user.first_name);
    }

    sendResponse(
        res,
        200,
        "If an unverified account exists for that email, a new verification link has been sent."
    );
});


export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body; // Add password check here in production

    const user = await AuthModel.findByEmail(email);
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

   
    if (!user.verified) {
        throw new AppError("Please verify your email address before signing in.", 403);
    }

    if (user.status !== "active") {
        throw new AppError(`Account is ${user.status}`, 403);
    }

  
    const accessToken = TokenUtils.generateAccessToken({
        userId: user.id,
        role: user.user_type,
    });


    const rawRefreshToken = TokenUtils.generateRefreshToken();
    const tokenHash = TokenUtils.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    const maxExpiryDate = new Date();
    maxExpiryDate.setDate(maxExpiryDate.getDate() + 30);


    await AuthModel.createSession({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        max_expiry_date: maxExpiryDate,
    });

    sendResponse(res, 200, "Sign in successful", {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            user_type: user.user_type,
        },
    });
});


export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken: incomingToken } = req.body;
    if (!incomingToken) {
        throw new AppError("Refresh token is required", 400);
    }

    const tokenHash = TokenUtils.hashToken(incomingToken);
    const session = await AuthModel.findValidSession(tokenHash);

    if (!session) {
        throw new AppError("Invalid or expired refresh token", 403);
    }

    // Issue new Access Token
    const newAccessToken = TokenUtils.generateAccessToken({
        userId: session.user_id,
        role: session.user_type,
    });

    sendResponse(res, 200, "Access token refreshed successfully", {
        accessToken: newAccessToken,
    });
});


export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken: incomingToken } = req.body;
    if (incomingToken) {
        const tokenHash = TokenUtils.hashToken(incomingToken);
        await AuthModel.revokeSession(tokenHash);
    }

    sendResponse(res, 200, "Logged out successfully");
});