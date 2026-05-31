import { UserPayload } from "./user.type.js";
export type Session = {
    id: string;

    userId: string;
    user: UserPayload;

    refreshTokenHash: string;

    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    userAgent: string | null;

    ipAddress: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    timezone: string | null;

    isRevoked: boolean;
    revokedAt: Date | null;
    revokeReason: string | null;

    expiresAt: Date;
    lastUsedAt: Date | null;

    loginAt: Date;
    createdAt: Date;
    updatedAt: Date;
};