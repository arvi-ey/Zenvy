import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export const validate =
    (schema: z.ZodType) =>
        (req: Request, _res: Response, next: NextFunction): void => {
            try {
                schema.parse(req.body);
                next();
            } catch (error: unknown) {
                if (error instanceof ZodError) {
                    const message = error.issues
                        .map((err) => `${err.message}`)
                        .join(", ");

                    next(new AppError(message, 400));
                    return;
                }

                next(error);
            }
        };