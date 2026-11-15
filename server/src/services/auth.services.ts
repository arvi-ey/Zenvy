import crypto from "crypto";
import { AuthModel } from "../models/auth.model.js";
import { Mailer } from "../utils/mailer.js";

export interface SignupInput {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar?: string;
    user_type?: 'admin' | 'user';
}


export async function handleUserRegistration(data: SignupInput) {
    const { first_name, last_name, email, phone, avatar, user_type } = data;

    const existingUser = await AuthModel.findByEmail(email);

    if (existingUser) {
        
        return { user: existingUser, isNew: false };
    }

   
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); 

  
    const newUser = await AuthModel.createUser(
        { first_name, last_name, email, phone, avatar, user_type },
        verificationToken,
        tokenExpiry
    );

    
    await Mailer.sendVerificationEmail(email, verificationToken, first_name);

    return { user: newUser, isNew: true };
}