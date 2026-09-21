"use client";

// components/shop/AddToCartButton.tsx — the shop's one Add-to-Cart control,
// shared by the shelf cards and the product detail page. Beyond the button's
// own success morph, it runs the "fly to cart" moment: a thumbnail chip
// springs off the product image and arcs into the navbar's cart icon, so the
// visitor unmistakably sees the item land in their bag.

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { Check, Plus } from "lucide-react";
import { addToCart } from "@/lib/cart";
import type { ProductItem } from "@/types/product";

/** Which element in the navbar receives the fly-in (set as a data attribute). */
const CART_TARGET_SELECTOR = "[data-cart-icon]";

interface AddToCartButtonProps {
  product: ProductItem;
  /** Extra classes for the button itself (sizing/shape per context). */
  className?: string;
}

/**
 * Sends a thumbnail chip arcing from `from` (the product image, or the
 * button as a fallback) to the navbar cart icon, then pops the icon on
 * arrival. The badge's own pop is driven by CartBadge seeing the count grow.
 */
function flyToCart(from: HTMLElement | null, product: ProductItem): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // The navbar renders both a desktop and a mobile cart icon; only the
  // visible one (non-zero box) is a valid landing target.
  const target = [...document.querySelectorAll<HTMLElement>(CART_TARGET_SELECTOR)].find(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0
  );
  const origin = from ?? document.querySelector<HTMLElement>(`#product-image-${product.id}`);
  if (!target) return;

  const chip = document.createElement("div");
  chip.setAttribute("aria-hidden", "true");
  chip.style.cssText = `
    position: fixed;
    z-index: 200;
    pointer-events: none;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 10px 30px rgba(20, 20, 20, 0.25);
  `;

  // The chip carries the product's photo when it has one.
  if (product.imageUrl) {
    const img = document.createElement("img");
    img.src = product.imageUrl;
    img.alt = "";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
    chip.appendChild(img);
  } else {
    chip.style.background = "#e3221c";
  }

  document.body.appendChild(chip);

  const start = origin
    ? origin.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 80, height: 80 };
  const end = target.getBoundingClientRect();
  const size = Math.min(start.width, 96);
  const startX = start.left + start.width / 2;
  const startY = start.top + start.height / 2;
  const endX = end.left + end.width / 2;
  const endY = end.top + end.height / 2;

  gsap.set(chip, {
    width: size,
    height: size,
    x: startX - size / 2,
    y: startY - size / 2,
  });

  // Arc via a control point lifted above the straight line between the two.
  const lift = Math.min(140, Math.abs(endY - startY) * 0.45 + 40);

  gsap
    .timeline({
      onComplete: () => {
        chip.remove();
        // Landing pop on the navbar icon itself.
        gsap.fromTo(
          target,
          { scale: 1 },
          { scale: 1.35, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }
        );
      },
    })
    // Two-stage arc: rise toward the lifted control point, then fall into the
    // cart — cheaper than shipping MotionPathPlugin for one curve.
    .to(chip, {
      x: (startX + endX) / 2 - size / 2,
      y: Math.min(startY, endY) - lift - size / 2,
      width: 56,
      height: 56,
      duration: 0.35,
      ease: "power2.out",
    })
    .to(
      chip,
      {
        // Shrink to 32px centered on the cart icon, fading as it lands.
        x: endX - 16,
        y: endY - 16,
        width: 32,
        height: 32,
        opacity: 0.4,
        duration: 0.3,
        ease: "power2.in",
      },
      ">-0.02"
    );
}

export default function AddToCartButton({
  product,
  className = "",
}: AddToCartButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(() => {
    addToCart(product);
    setAdded(true);

    // Resolve the image element at click time — the shelf re-renders on
    // category cuts and load-more, so stale refs can't be trusted.
    const imageEl =
      document.querySelector<HTMLElement>(`#product-image-${product.id}`) ?? null;
    flyToCart(imageEl ?? buttonRef.current, product);

    window.setTimeout(() => setAdded(false), 1800);
  }, [product]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleAdd}
      disabled={!product.inStock}
      className={`add-to-cart group/btn relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm transition-all duration-300 active:scale-95 ${
        !product.inStock
          ? "bg-cream-200 text-ink-500 cursor-not-allowed"
          : added
            ? "bg-brand-hover text-cream-50"
            : "bg-brand-primary text-cream-50 hover:bg-brand-hover"
      } ${className}`}
    >
      {/* Two stacked labels cross-fade on the success morph. */}
      <span
        className={`flex items-center gap-2 transition-all duration-300 ${
          added ? "scale-50 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Plus size={13} aria-hidden="true" />
        Add to Cart
      </span>
      <span
        aria-hidden={!added}
        className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${
          added ? "scale-100 opacity-100" : "scale-150 opacity-0"
        }`}
      >
        <Check size={14} aria-hidden="true" />
        Added
      </span>
    </button>
  );
}
