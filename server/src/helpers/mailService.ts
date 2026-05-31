import { Resend } from 'resend';

const resend = new Resend(process.env.MAIL_API_KEY);

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