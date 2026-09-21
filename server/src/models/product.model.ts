import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Product — one Marvela Business Enterprise item listed in the shop.
 * Purchases are NOT processed on this site: every product carries the
 * `selarUrl` of its Selar store page, and the cart's checkout simply
 * routes the buyer there.
 */
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
      lowercase: true,
      maxlength: 160,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "category is required"],
      trim: true,
      maxlength: 60,
      index: true,
    },
    /** Rich-text write-up (sanitized HTML from the admin editor). */
    description: {
      type: String,
      trim: true,
      maxlength: 20000,
      default: "",
    },
    /** Display price for the shelf; the authoritative price is Selar's. */
    price: {
      type: Number,
      required: [true, "price is required"],
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 8,
      default: "NGN",
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    /** The Selar store page the buyer is routed to at checkout. */
    selarUrl: {
      type: String,
      required: [true, "selarUrl is required"],
      trim: true,
      maxlength: 2048,
      validate: {
        validator: (value: string) => /^https:\/\/.+/i.test(value),
        message: "selarUrl must be a valid https:// URL",
      },
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Public listing query: newest first within a category.
productSchema.index({ category: 1, createdAt: -1 });

export type ProductDocument = InferSchemaType<typeof productSchema>;

interface ProductModel extends Model<ProductDocument> {
  // Placeholder for future statics.
}

export const Product: ProductModel = (mongoose.models.Product ??
  mongoose.model<ProductDocument, ProductModel>("Product", productSchema)) as ProductModel;
