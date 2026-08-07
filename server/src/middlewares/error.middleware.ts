import { Request, Response, NextFunction } from "express";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    switch (err.code) {
        // Unique constraint
        case "23505":
            statusCode = 409;
            message = `${err.column || "Field"} already exists.`;
            break;

        // Foreign key
        case "23503":
            statusCode = 409;
            message = `Invalid reference for '${err.column || "field"}'.`;
            break;

        // NOT NULL
        case "23502":
            statusCode = 400;
            message = `${err.column} is required.`;
            break;

        // CHECK constraint
        case "23514":
            statusCode = 400;
            message = `Invalid value for '${err.column || "field"}'.`;
            break;

        // Invalid UUID / Integer / Boolean etc.
        case "22P02":
            statusCode = 400;
            message = "Invalid input format.";
            break;

        // Undefined table
        case "42P01":
            statusCode = 500;
            message = "Database table not found.";
            break;

        // Undefined column
        case "42703":
            statusCode = 500;
            message = "Database column not found.";
            break;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {
            error: {
                code: err.code,
                detail: err.detail,
                constraint: err.constraint,
                column: err.column,
                table: err.table,
                schema: err.schema,
                stack: err.stack,
            },
        }),
    });
};

export default globalErrorHandler;