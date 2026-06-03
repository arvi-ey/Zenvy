import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.MAIL_API_KEY);

export const sendEmail = async (
    to: string,
    subject: string,
    html: string
) => {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html
    });
};