// lib/cart.ts — the visitor's cart, kept in localStorage.
//
// Payment is NOT processed on this site: every product is hosted on Selar,
// and checkout simply routes the buyer to the product's Selar page. So the
// cart only needs a product snapshot + quantity per line — it stays usable
// even if the shop API is offline, and never holds anything sensitive.

import type { ProductItem } from "@/types/product";

/** One cart line — a snapshot of the product at the moment it was added. */
export interface CartLine {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  selarUrl: string;
  quantity: number;
}

const STORAGE_KEY = "eleos-cart-v1";
const CHANGE_EVENT = "eleos-cart-changed";

/** Reads the cart; an unreadable/missing store reads as empty. */
export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only keep lines that still carry the fields the cart page needs.
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).id === "string" &&
        typeof (line as CartLine).selarUrl === "string" &&
        typeof (line as CartLine).quantity === "number"
    );
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // Storage full or blocked (private mode) — the cart simply won't persist.
  }
}

/** Adds a product (or bumps its quantity if it's already in the cart). */
export function addToCart(product: ProductItem, quantity = 1): void {
  const lines = readCart();
  const existing = lines.find((line) => line.id === product.id);
  if (existing) {
    existing.quantity += quantity;
    writeCart(lines);
    return;
  }
  writeCart([
    ...lines,
    {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
      selarUrl: product.selarUrl,
      quantity,
    },
  ]);
}

/** Sets a line's quantity (clamped to 1–99); removes the line at 0. */
export function setQuantity(productId: string, quantity: number): void {
  const clamped = Math.min(99, Math.max(0, Math.trunc(quantity)));
  if (clamped === 0) {
    removeFromCart(productId);
    return;
  }
  writeCart(
    readCart().map((line) => (line.id === productId ? { ...line, quantity: clamped } : line))
  );
}

export function removeFromCart(productId: string): void {
  writeCart(readCart().filter((line) => line.id !== productId));
}

export function clearCart(): void {
  writeCart([]);
}

/** Total number of items across all lines (for the navbar badge). */
export function cartCount(lines: CartLine[] = readCart()): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Subscribes to cart changes (same-tab). Returns an unsubscribe function. */
export function onCartChange(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
