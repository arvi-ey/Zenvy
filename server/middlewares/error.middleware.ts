import { Request, Response, NextFunction } from "express";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (err.code === "P2002") {
        const field = err.meta?.target?.[0];
        err.statusCode = 409;
        err.message = `${field} already exists`;
    }
    if (err.code === "P2025") {
        const model = err.meta?.modelName || "Resource";
        err.statusCode = 404;

        err.message = `${model} not found`;
    }
    let statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined,
    });
};

export default globalErrorHandler;