import nodemailer from "nodemailer"; 

const MAIL_API_KEY = process.env.MAIL_API_KEY;
const FRONTEND_URL = process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_BASE_URL_PROD 
    : process.env.FRONTEND_BASE_URL_DEV;

export class Mailer {
    static async sendVerificationEmail(email: string, token: string, firstName: string) {
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

        
        const transporter = nodemailer.createTransport({
            service: "SendGrid", // or your provider service mapped via MAIL_API_KEY
            auth: {
                user: "apikey",
                pass: MAIL_API_KEY,
            },
        });

        const mailOptions = {
            from: '"Your App" <no-reply@yourapp.com>',
            to: email,
            subject: "Verify Your Email Address",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome, ${firstName}!</h2>
                    <p>Thank you for signing up. Please click the button below to verify your email address. This link expires in 24 hours.</p>
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
    }
}