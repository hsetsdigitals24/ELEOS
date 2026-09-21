import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as productService from "../services/product.service.ts";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../validators/product.validator.ts";

/**
 * ProductController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** GET /api/v1/products?category=&page=&limit= — public shop listing. */
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListProductsQuery.
  const query = req.query as unknown as ListProductsQuery;
  const result = await productService.listProducts(query);
  return ApiResponse.success(res, 200, "Products fetched successfully", result);
});

/** GET /api/v1/products/categories — distinct categories with counts. */
export const listProductCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await productService.listProductCategories();
  return ApiResponse.success(res, 200, "Categories fetched successfully", { categories });
});

/** GET /api/v1/products/:slug — one product by slug. */
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const product = await productService.getProductBySlug(slug);
  return ApiResponse.success(res, 200, "Product fetched successfully", product);
});

/** POST /api/v1/admin/products — add a product to the shop. */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed CreateProductInput.
  const input = req.body as CreateProductInput;
  const product = await productService.createProduct(input);
  return ApiResponse.success(res, 201, "Product created successfully", product);
});

/** PUT /api/v1/admin/products/:id — update a product. */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateProductInput;
  const product = await productService.updateProduct(id, input);
  return ApiResponse.success(res, 200, "Product updated successfully", product);
});

/** DELETE /api/v1/admin/products/:id — remove a product. */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await productService.deleteProduct(id);
  return ApiResponse.success(res, 200, "Product deleted successfully");
});
