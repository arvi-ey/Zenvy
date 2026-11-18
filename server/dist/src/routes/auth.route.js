import { Router } from "express";
import { z } from "zod";
import { routeLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/routeValidator.js";
import { signup, login, logout, refreshToken, verifyEmail, resendVerificationEmail, getCurrentUser, issueCsrfToken, } from "../controller/auth.controller.js";
import { requireAuth } from "../middlewares/auth.midleware.js";
import { validateAuthOrigin } from "../middlewares/authOrigin.middleware.js";
const router = Router();
const email = z.email().trim().max(100);
const password = z.string().min(8).max(72);
const signUpSchema = z.object({
    first_name: z.string().trim().min(2).max(50),
    last_name: z.string().trim().min(2).max(50),
    email,
    phone: z.string().trim().min(10).max(15),
    password: password
        .regex(/[A-Z]/, "Password must contain an uppercase letter.")
        .regex(/[0-9]/, "Password must contain a number.")
        .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 bytes."),
}).strict();
const signInSchema = z.object({
    email,
    password: password.refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 bytes."),
}).strict();
const verifyEmailSchema = z.object({
    token: z.string().trim().min(1),
}).strict();
const resendVerificationEmailSchema = z.object({
    email,
}).strict();
// --Users Sign-up
router.post("/sign-up", routeLimiter(60, 12, `Too many sign-up attempts. Please try ${1} hour later.`), validate(signUpSchema, "body"), signup);
router.post("/verify-email", routeLimiter(15, 10, "Too many verification attempts. Please try again later."), validate(verifyEmailSchema, "body"), verifyEmail);
router.post("/resend-verification", routeLimiter(15, 5, "Too many resend requests. Please try again later."), validate(resendVerificationEmailSchema, "body"), resendVerificationEmail);
router.post("/login", routeLimiter(15, 10, "Too many login  attempts. Please try again later."), validate(signInSchema, "body"),    login);
router.post("/sign-in", routeLimiter(15, 10, "Too many login attempts. Please try again later."), validate(signInSchema, "body"),    login);
router.get("/csrf",    issueCsrfToken);
router.post("/refresh",    refreshToken);
router.post("/sign-out",    logout);
router.get("/me",    requireAuth, getCurrentUser);
// router.post(
//     "/admin/sign-up",
//       
//     routeLimiter(5, 10, "Too many admin registration attempts. Please try again later."),
//     validate(signUpSchema, "body"),
//     adminSignUp
// );
// router.post(
//     "/admin/sign-in",
//       
//     routeLimiter(15, 10, "Too many sign-in attempts. Please try again later."),
//     validate(signInSchema, "body"),
//     adminSignIn
// );
// router.post(
//     "/sign-up",
//       
//     routeLimiter(15, 10, "Too many sign-up attempts. Please try again later."),
//     validate(signUpSchema, "body"),
//     signUp
// );
// router.post(
//     "/sign-in",
//       
//     routeLimiter(15, 10, "Too many sign-in attempts. Please try again later."),
//     validate(signInSchema, "body"),
//     signIn
// );
// router.post("/refresh",    refreshSession);
// router.post("/sign-out",    signOut);
export default router;
