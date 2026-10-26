import { Router } from "express";
import { z } from "zod";
import { createAddress, deleteAddress, getAddresses } from "../controller/address.controller.js";
import { requireAuth } from "../middlewares/auth.midleware.js";
import { validate } from "../middlewares/routeValidator.js";

const router = Router();

const addressSchema = z.object({
    street: z.string().trim().min(3).max(500),
    landmark: z.string().trim().max(200).optional(),
    pincode: z.string().trim().min(3).max(20),
    state: z.string().trim().min(2).max(110),
    district: z.string().trim().min(2).max(100),
    type: z.enum(["home", "office", "others"]),
}).strict();

router.use(requireAuth);
router.get("/", getAddresses);
router.post("/", validate(addressSchema, "body"), createAddress);
router.delete(
    "/:addressId",
    validate(z.object({ addressId: z.coerce.number().int().positive() }).strict(), "params"),
    deleteAddress
);

export default router;
