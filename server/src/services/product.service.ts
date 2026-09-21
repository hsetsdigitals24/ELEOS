import { AppError } from "../utils/AppError.ts";
import { slugify } from "../utils/slugify.ts";
import { Product, type ProductDocument } from "../models/product.model.ts";
import { sanitizeContentHtml } from "./post.service.ts";
import type { PaginatedResult, ProductItem } from "../types/index.ts";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../validators/product.validator.ts";

/**
 * ProductService — ALL product business logic and database access lives
 * here. Controllers never touch Mongoose directly.
 */

/** Lean product shape as returned by `.lean()` reads. */
type LeanProduct = Omit<ProductDocument, "_id"> & { _id: { toString(): string } };

/** Maps a lean document to the public API shape. */
function toProductItem(doc: LeanProduct): ProductItem {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    description: doc.description ?? "",
    price: doc.price,
    currency: doc.currency ?? "NGN",
    imageUrl: doc.imageUrl ?? "",
    imageAlt: doc.imageAlt ?? "",
    selarUrl: doc.selarUrl,
    inStock: doc.inStock ?? true,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

export interface CreateProductServiceInput extends CreateProductInput {}

export async function createProduct(input: CreateProductServiceInput): Promise<ProductItem> {
  const { slug, description, ...rest } = input;
  const created = await Product.create({
    ...rest,
    slug: slug && slug.length > 0 ? slug : slugify(input.name),
    // The description is rich text from the admin editor — sanitize it.
    ...(description !== undefined ? { description: sanitizeContentHtml(description) } : {}),
  });
  return toProductItem(created.toObject() as LeanProduct);
}

export async function listProducts(
  query: ListProductsQuery
): Promise<PaginatedResult<ProductItem>> {
  const { category, page, limit } = query;

  const filter = category ? { category } : {};

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toProductItem(doc as unknown as LeanProduct)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<ProductItem> {
  const doc = await Product.findOne({ slug }).lean();
  if (!doc) {
    throw new AppError("Product not found", 404);
  }
  return toProductItem(doc as unknown as LeanProduct);
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<ProductItem> {
  // The description is rich text from the admin editor — sanitize it.
  const patch: Record<string, unknown> = { ...input };
  if (typeof patch.description === "string") {
    patch.description = sanitizeContentHtml(patch.description);
  }
  // An explicit empty-string slug would break the unique index's meaning —
  // drop it rather than trying to save it.
  if (patch.slug === "") delete patch.slug;

  const updated = await Product.findOneAndUpdate({ _id: productId }, { $set: patch }, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new AppError("Product not found", 404);
  }

  return toProductItem(updated as unknown as LeanProduct);
}

export async function deleteProduct(productId: string): Promise<void> {
  const result = await Product.deleteOne({ _id: productId });
  if (result.deletedCount === 0) {
    throw new AppError("Product not found", 404);
  }
}

/** Distinct categories with counts — backs the shop's category chips. */
export async function listProductCategories(): Promise<
  Array<{ name: string; count: number }>
> {
  const results = await Product.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return results.map((row) => ({ name: row._id, count: row.count }));
}
