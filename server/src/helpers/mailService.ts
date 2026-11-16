import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.MAIL_API_KEY);

export const sendEmail = async (
    to: string,
    subject: string,
    html: string
) => {
    const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html
    });

    if (error) {
        throw new Error(`Email delivery failed: ${error.message}`);
    }
};