import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
export const validate = (schema, source) => (req, _res, next) => {
    try {
        schema.parse(req[source]);
        next();
    }
    catch (error) {
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
