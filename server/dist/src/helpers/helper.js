import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";
export const generateHash = async (val) => {
    const hashedval = await bcrypt.hash(val, 10);
    return hashedval;
};
export const compareHash = async (hashedval, rawval) => {
    const isMatch = await bcrypt.compare(rawval, hashedval);
    return isMatch;
};
export const generateVerificationToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return {
        rawToken,
        hashedToken,
        expiresAt,
    };
};
export const getHashed = (token) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    return hashedToken;
};
const frontendurl = env.NODE_ENV == "production" ? env.FRONTEND_BASE_URL_PROD : env.FRONTEND_BASE_URL_DEV;
export const verificationEmailTemplate = (firstName, verificationUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
</head>
<body style="
  margin:0;
  padding:0;
  background:#f8fafc;
  font-family:Arial, Helvetica, sans-serif;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <table width="600" cellpadding="0" cellspacing="0" style="
          background:#ffffff;
          border-radius:12px;
          overflow:hidden;
          box-shadow:0 8px 24px rgba(0,0,0,0.08);
        ">

          <!-- Header -->
          <tr>
            <td style="
              background:#111827;
              color:#ffffff;
              padding:28px;
              text-align:center;
              font-size:24px;
              font-weight:bold;
            ">
              Verify Your Email
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px; color:#111827;">

              <p style="font-size:16px; margin:0 0 16px;">
                Hi ${firstName},
              </p>

              <p style="
                font-size:16px;
                line-height:1.6;
                color:#374151;
                margin:0 0 24px;
              ">
                Thanks for creating your account.  
                Please verify your email address to activate your account.
              </p>

              <div style="text-align:center; margin:32px 0;">
                <a
                  href="${frontendurl}verify-email?v=${verificationUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#22c55e;
                    color:#ffffff;
                    text-decoration:none;
                    font-weight:600;
                    border-radius:8px;
                    font-size:16px;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p style="
                font-size:14px;
                color:#6b7280;
                line-height:1.6;
                margin:24px 0;
              ">
                This verification link will expire in 
                <strong>10 minutes</strong>.
              </p>

              <p style="
                font-size:14px;
                color:#6b7280;
                line-height:1.6;
              ">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>

              <p style="
                font-size:13px;
                word-break:break-all;
                color:#2563eb;
              ">
                ${verificationUrl}
              </p>

              <hr style="
                border:none;
                border-top:1px solid #e5e7eb;
                margin:32px 0;
              ">

              <p style="
                font-size:13px;
                color:#9ca3af;
                line-height:1.6;
              ">
                If you did not create this account, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background:#f9fafb;
              padding:20px;
              text-align:center;
              font-size:12px;
              color:#9ca3af;
            ">
              © ${new Date().getFullYear()} Zenvy. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
export const generateAccessToken = (payload) => {
    const accessToken = jwt.sign({
        id: payload.id,
        email: payload.email,
        role: payload.userType,
    }, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });
    return accessToken;
};
export const generateRefreshToken = () => {
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return { refreshToken, expiresAt };
};
export const getDeviceInfo = async (req) => {
    const userAgent = req.headers["user-agent"] || "";
    let browser = "Unknown";
    let os = "Unknown";
    let deviceType = "desktop";
    // Browser
    if (userAgent.includes("Chrome")) {
        browser = "Chrome";
    }
    else if (userAgent.includes("Firefox")) {
        browser = "Firefox";
    }
    else if (userAgent.includes("Safari")) {
        browser = "Safari";
    }
    else if (userAgent.includes("Postman")) {
        browser = "Postman";
    }
    if (userAgent.includes("Windows")) {
        os = "Windows";
    }
    else if (userAgent.includes("Linux")) {
        os = "Linux";
    }
    else if (userAgent.includes("Mac")) {
        os = "MacOS";
    }
    else if (userAgent.includes("Android")) {
        os = "Android";
        deviceType = "mobile";
    }
    else if (userAgent.includes("iPhone") ||
        userAgent.includes("iPad")) {
        os = "iOS";
        deviceType = "mobile";
    }
    else if (userAgent.includes("Tablet")) {
        deviceType = "tablet";
    }
    const response = await fetch(`http://ip-api.com/json/${"203.0.113.10"}`);
    const locationData = await response.json();
    let payloadObj = {};
    payloadObj.browser = browser;
    payloadObj.os = os;
    payloadObj.deviceType = deviceType;
    let returnobj = { ...payloadObj, locationData };
    return returnobj;
};
export const generatecategorySlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
};
