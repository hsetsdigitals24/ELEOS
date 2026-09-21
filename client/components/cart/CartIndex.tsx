"use client";

// components/cart/CartIndex.tsx — the cart: an editorial order sheet of
// localStorage lines with quantity steppers and a running estimated total.
// Payment never happens here — each line carries a "Proceed to Selar"
// action that routes the buyer to that product's Selar page, since Selar
// (not this site) processes the purchase.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ExternalLink,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { onCartChange, readCart, removeFromCart, setQuantity, type CartLine } from "@/lib/cart";
import { formatMoney } from "@/lib/formatMoney";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Groups lines by currency so the total is always honest. */
function useCartTotals(lines: CartLine[]) {
  return useMemo(() => {
    const totals = new Map<string, number>();
    for (const line of lines) {
      totals.set(line.currency, (totals.get(line.currency) ?? 0) + line.price * line.quantity);
    }
    return [...totals.entries()];
  }, [lines]);
}

function CartRow({ line }: { line: CartLine }) {
  return (
    <article className="cart-row group grid sm:grid-cols-[96px_1fr_auto] gap-5 sm:gap-7 items-center border-t border-ink-900/15 last:border-b py-7">
      {/* Image */}
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-cream-200 shrink-0">
        {line.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- snapshot URL captured at add-to-cart time
          <img
            src={line.imageUrl}
            alt={line.imageAlt || line.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
            <ShoppingBag size={24} strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Details + stepper */}
      <div className="min-w-0">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brand-primary font-semibold">
          {line.category}
        </p>
        <h2 className="mt-1.5 font-display text-xl leading-snug text-ink-900">{line.name}</h2>
        <p className="mt-1 font-sans text-sm text-ink-500 tabular-nums">
          {formatMoney(line.price, line.currency)} each
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center border border-ink-900/20 rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(line.id, line.quantity - 1)}
              aria-label={`Decrease quantity of ${line.name}`}
              className="w-9 h-9 flex items-center justify-center text-ink-700 hover:bg-cream-200 hover:text-brand-primary transition-colors"
            >
              <Minus size={13} aria-hidden="true" />
            </button>
            <span className="w-10 text-center font-sans text-sm font-semibold text-ink-900 tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.id, line.quantity + 1)}
              aria-label={`Increase quantity of ${line.name}`}
              className="w-9 h-9 flex items-center justify-center text-ink-700 hover:bg-cream-200 hover:text-brand-primary transition-colors"
            >
              <Plus size={13} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(line.id)}
            className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-ink-500 hover:text-brand-primary transition-colors"
          >
            <Trash2 size={13} aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      {/* Line total + Selar action */}
      <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-4 justify-between">
        <span className="font-display text-xl text-ink-900 font-semibold tabular-nums">
          {formatMoney(line.price * line.quantity, line.currency)}
        </span>
        <a
          href={line.selarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 group/btn"
        >
          Proceed to Selar
          <ExternalLink
            size={12}
            aria-hidden="true"
            className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
          />
        </a>
      </div>
    </article>
  );
}

export default function CartIndex() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Read in an effect (not at render) so SSR markup and first client paint match.
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readCart());
    setHydrated(true);
    return onCartChange(() => setLines(readCart()));
  }, []);

  const totals = useCartTotals(lines);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".cart-sheet > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cart-sheet",
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [hydrated, lines.length] }
  );

  return (
    <div ref={sectionRef}>
      <PageHero
        id="cart-hero"
        title="Your Cart"
        breadcrumb="Cart"
      />

      <div className="bg-cream-100 px-6 py-10 md:py-14">
        <div className="max-w-330 mx-auto">
          {!hydrated ? (
            /* Avoids a flash of "empty cart" while localStorage loads */
            <div className="py-16" aria-hidden="true" />
          ) : lines.length === 0 ? (
            /* ── Empty state ──────────────────────────────────── */
            <div className="py-20 flex flex-col items-center text-center">
              <span className="w-16 h-16 rounded-full bg-cream-200 border border-cream-200 flex items-center justify-center text-brand-primary/50 mb-7">
                <ShoppingBag size={26} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 className="font-display text-3xl text-ink-900">Your cart is empty.</h2>
              <p className="mt-4 font-sans text-sm text-ink-500 max-w-md leading-relaxed">
                The Marvela shelf is stocked with natural, healthy and everyday essentials —
                go find what your household needs.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
              >
                Browse the Shop
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            /* ── The order sheet ──────────────────────────────── */
            <div className="cart-sheet grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-12 items-start">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold pb-3">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                </p>
                {lines.map((line) => (
                  <CartRow key={line.id} line={line} />
                ))}
                <Link
                  href="/shop"
                  className="mt-7 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
                >
                  Continue shopping
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {/* Summary rail */}
              <aside className="lg:border-l lg:border-ink-900/15 lg:pl-8 space-y-5">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold">
                  Order summary
                </p>
                {totals.map(([currency, amount]) => (
                  <div
                    key={currency}
                    className="flex items-baseline justify-between border-b border-ink-900/15 pb-4"
                  >
                    <span className="font-sans text-sm text-ink-500">
                      Estimated total ({currency})
                    </span>
                    <span className="font-display text-2xl text-ink-900 font-semibold tabular-nums">
                      {formatMoney(amount, currency)}
                    </span>
                  </div>
                ))}

                <div className="bg-cream-50 border border-ink-900/12 rounded-md p-5 space-y-3">
                  <p className="flex items-start gap-2.5 font-sans text-xs text-ink-700 leading-relaxed">
                    <ShieldCheck size={15} className="text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
                    Payment is processed securely on Selar&rsquo;s platform. Use the{" "}
                    <span className="font-semibold text-ink-900">Proceed to Selar</span>{" "}
                    button on each item to complete its purchase.
                  </p>
                  <p className="font-sans text-xs text-ink-500 leading-relaxed">
                    Prices shown are estimates captured when items were added — Selar&rsquo;s
                    listed price is always the authoritative one.
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="block text-center border border-ink-900/25 text-ink-900 px-6 py-3 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
                >
                  Questions about an order?
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
