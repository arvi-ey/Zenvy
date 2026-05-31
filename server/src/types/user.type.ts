import { Session } from "./session.type.js";

enum UserType {
    user = 'user',

}

enum AccountStatus {
    active = 'active',

}

export type UserPayload = {
    id: string;

    firstName: string;
    lastName: string;

    email: string;
    phone: string | null;

    passwordHash: string;

    verificationTokenHash: string | null;
    verificationTokenExpiresAt: Date | null;
    verified: boolean;

    userType: UserType;

    accountStatus: AccountStatus;

    profilePhoto: string | null;
    dob: Date | null;

    passwordChangedAt: Date | null;
    lastLoginAt: Date | null;

    createdAt: Date;
    updatedAt: Date;

    deletedAt: Date | null;

    sessions: Session[]; // define Session type separately
};