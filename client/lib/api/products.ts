// lib/api/products.ts — typed client for the public products API.

import { request } from "./client";
import type { ProductCategories, ProductItem, ProductsPage } from "@/types/product";

/** Lists shop products (newest first), optionally cut by category. */
export async function fetchProducts(params: {
  category?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ProductsPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 24),
  });
  if (params.category) query.set("category", params.category);

  return request<ProductsPage>(`/products?${query.toString()}`, {
    serviceName: "shop service",
  });
}

/** Distinct categories with product counts — backs the shop's chips. */
export async function fetchProductCategories(): Promise<ProductCategories> {
  return request<ProductCategories>("/products/categories", {
    serviceName: "shop service",
  });
}

/** One product by slug. */
export async function fetchProductBySlug(slug: string): Promise<ProductItem> {
  return request<ProductItem>(`/products/${encodeURIComponent(slug)}`, {
    serviceName: "shop service",
  });
}
