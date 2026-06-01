import express from "express";
import { verifyRegistration } from "../controllers/auth.controller.js";
import { signupSchema } from "../validators/authvalidator.js";
import { validate } from "../middlewares/routeValidator.js";
const router = express.Router()


router.post('/verify-registration', validate(signupSchema), verifyRegistration)

export default router