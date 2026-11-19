import { sendEmail } from "../helpers/mailService.js";
import { env } from "../config/env.js";

const FRONTEND_URL = env.NODE_ENV === "production"
    ? env.FRONTEND_BASE_URL_PROD
    : env.FRONTEND_BASE_URL_DEV;

export class Mailer {
    static async sendVerificationEmail(email: string, token: string, firstName: string, next?: string) {
        const verificationUrl = new URL("/verify-email", FRONTEND_URL);
        verificationUrl.searchParams.set("token", token);
        if (next) verificationUrl.searchParams.set("next", next);
        const verificationLink = verificationUrl.toString();
        console.log("Verification Link:", verificationLink);

        
        const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome, ${firstName}!</h2>
                    <p>Thank you for signing up. Please click the button below to verify your email address. This link expires in 24 hours.</p>
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `;

        await sendEmail(email, "Verify Your Email Address", html);
    }
}