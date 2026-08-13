import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export const validate =
    (
        schema: z.ZodType,
        source: "body" | "query" | "params"
    ) =>
        (req: Request, _res: Response, next: NextFunction): void => {
            try {
                schema.parse(req[source]);
                next();

            } catch (error: unknown) {

                if (error instanceof ZodError) {

                    const message = error.issues
                        .map((err) => {

                            if (err.code === "unrecognized_keys") {
                                return `Field(s) ${err.keys
                                    .map((key) => `'${key}'`)
                                    .join(", ")} not allowed`;
                            }

                            return err.message;
                        })
                        .join(", ");

                    next(new AppError(message, 400));
                    return;
                }

                next(error);
            }
        };