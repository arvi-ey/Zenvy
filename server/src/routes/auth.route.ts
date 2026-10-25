import { Router } from "express";
import { z } from "zod";
import {
    getCurrentUser,
    refreshSession,
    signIn,
    signOut,
    signUp,
} from "../controller/auth.controller.js";
import { requireAuth } from "../middlewares/auth.midleware.js";
import { routeLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/routeValidator.js";
import { validateAuthOrigin } from "../middlewares/authOrigin.middleware.js";

const router = Router();
const email = z.email().trim().max(100);
const password = z.string().min(8).max(72);
const signUpSchema = z.object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email,
    phone: z.string().trim().min(10).max(15),
    password: password
        .regex(/[A-Z]/, "Password must contain an uppercase letter.")
        .regex(/[0-9]/, "Password must contain a number.")
        .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 bytes."),
}).strict();
const signInSchema = z.object({
    email,
    password: password.refine(
        (value) => Buffer.byteLength(value, "utf8") <= 72,
        "Password must be at most 72 bytes."
    ),
}).strict();

router.post(
    "/sign-up",
    validateAuthOrigin,
    routeLimiter(15, 10, "Too many sign-up attempts. Please try again later."),
    validate(signUpSchema, "body"),
    signUp
);
router.post(
    "/sign-in",
    validateAuthOrigin,
    routeLimiter(15, 10, "Too many sign-in attempts. Please try again later."),
    validate(signInSchema, "body"),
    signIn
);
router.post("/refresh", validateAuthOrigin, refreshSession);
router.post("/sign-out", validateAuthOrigin, signOut);
router.get("/me", requireAuth, getCurrentUser);

export default router;
