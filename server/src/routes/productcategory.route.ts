import { Router } from "express";
import { AddProductCategory, GetProductCategories } from "../controller/product_category.controller.js";
const router = Router()

router.post('/create', AddProductCategory)
router.get('/get-categories', GetProductCategories)

export default router