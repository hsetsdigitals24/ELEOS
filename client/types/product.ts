// types/product.ts — shared shapes for the shop, used by the API clients
// (lib/api/products.ts, lib/api/admin.ts), the shop page and the cart.

/** Public product shape returned by the API. */
export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  selarUrl: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsPage {
  items: ProductItem[];
  pagination: ProductPagination;
}

export interface ProductCategories {
  categories: Array<{ name: string; count: number }>;
}

/** Payload for creating/updating a product from the admin console. */
export interface ProductInput {
  name: string;
  category: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  imageAlt?: string;
  selarUrl: string;
  inStock?: boolean;
  slug?: string;
}
