import { z } from "zod";

export const signupSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters"),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters"),

    email: z
        .email()
        .trim()
        .min(1, "Email is required"),

    phone: z
        .string()
        .min(10, "Phone number is too short"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain uppercase")
        .regex(/[0-9]/, "Must contain number"),
},).strict()
export const verifysignuproute = z.object({
    token: z
        .string()
        .min(1, "Tokwn is required"),
}).strict()