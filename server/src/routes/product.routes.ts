import { Router } from "express";
import {
  getProductBySlug,
  listProductCategories,
  listProducts,
} from "../controllers/product.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { listProductsQuerySchema } from "../validators/product.validator.ts";

/**
 * Product routes — the public shop. Everything is validated with Zod
 * before reaching a controller.
 *
 *   GET /api/v1/products              → paginated shop listing
 *   GET /api/v1/products/categories   → distinct categories with counts
 *   GET /api/v1/products/:slug        → one product
 */
const productRouter = Router();

productRouter.get("/products", validate(listProductsQuerySchema, "query"), listProducts);
productRouter.get("/products/categories", listProductCategories);
productRouter.get("/products/:slug", getProductBySlug);

export { productRouter };
