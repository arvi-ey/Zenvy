import express from "express";
// import { verifyRegistration, verifySignUp } from "../controllers/auth.controller.js";
import { signupSchema, verifysignuproute } from "../validators/authvalidator.js";
import { validate } from "../middlewares/routeValidator.js";
const router = express.Router()


// router.post('/verify-registration', validate(signupSchema), verifyRegistration)
// router.post('/verify-email', validate(verifysignuproute), verifySignUp)

export default router