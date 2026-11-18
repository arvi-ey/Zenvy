import AppError from "../utils/AppError.js";
export function csrfProtection(req, _res, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method))
        return next();
    if (req.path === "/csrf")
        return next();
    const publicAuthMutations = new Set([
        "/sign-up",
        "/verify-email",
        "/resend-verification",
        "/sign-in",
        "/login",
    ]);
    const authEndpoint = req.path.match(/\/auth\/([^/?]+)$/)?.[1];
    if (authEndpoint && publicAuthMutations.has(`/${authEndpoint}`))
        return next();
    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.get("x-csrf-token");
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return next(new AppError("Invalid CSRF token", 403));
    }
    return next();
}
