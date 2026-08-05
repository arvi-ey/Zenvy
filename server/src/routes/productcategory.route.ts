import { Router } from "express";
import { AddProductCategory } from "../controller/product_category.controller.js";
const router = Router()

router.post('/create', AddProductCategory)

export default router