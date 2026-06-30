import catchAsync from "../utils/catchAsync.js";

import AppError from "../utils/AppError.js";
import { NextFunction, Request, Response } from "express";
import { generatecategorySlug } from "../helpers/helper.js";



// export const addProductCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const { name } = req.body
//     const slugname = generatecategorySlug(name)
//     const category = await prisma.category.create({
//         data: {
//             name,
//             slug: slugname
//         }
//     })

// })