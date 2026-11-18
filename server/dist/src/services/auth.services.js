import crypto from "crypto";
import bcrypt from "bcrypt";
import { AuthModel } from "../models/auth.model.js";
import { Mailer } from "../utils/mailer.js";
export async function handleUserRegistration(data) {
    const { first_name, last_name, email, phone, avatar, user_type, password } = data;
    const existingUser = await AuthModel.findByEmail(email);
    if (existingUser) {
        return { user: existingUser, isNew: false };
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    const newUser = await AuthModel.createUser({
        first_name,
        last_name,
        email,
        phone,
        avatar,
        user_type,
        password_hash: await bcrypt.hash(password, 12),
    }, verificationToken, tokenExpiry);
    await Mailer.sendVerificationEmail(email, verificationToken, first_name);
    return { user: newUser, isNew: true };
}
