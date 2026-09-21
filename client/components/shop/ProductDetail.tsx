"use client";

// components/shop/ProductDetail.tsx — one product, laid out like a feature
// spread: a full-bleed image moment beside a ruled order panel with the
// price, the Add-to-Cart control (with its fly-to-cart animation) and the
// Selar checkout link. The description gets its own reading column below,
// closed by a route back to the shelf.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { ApiError } from "@/lib/api/client";
import { fetchProductBySlug } from "@/lib/api/products";
import { formatMoney } from "@/lib/formatMoney";
import type { ProductItem } from "@/types/product";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type LoadState = "loading" | "ready" | "offline" | "error" | "missing";

/** What the shelf always says about a product, in detail. */
function ProductFacts({ product }: { product: ProductItem }) {
  const facts: Array<{ label: string; value: string }> = [
    { label: "Category", value: product.category },
    { label: "Availability", value: product.inStock ? "In stock" : "Out of stock" },
    { label: "Currency", value: product.currency },
  ];
  return (
    <dl className="grid grid-cols-3 border-t border-b border-ink-900/15 divide-x divide-ink-900/15">
      {facts.map((fact) => (
        <div key={fact.label} className="px-3 py-4 first:pl-0 text-center sm:text-left">
          <dt className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-ink-500">
            {fact.label}
          </dt>
          <dd className="mt-1 font-sans text-sm font-semibold text-ink-900">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductDetail({ slug }: { slug: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [product, setProduct] = useState<ProductItem | null>(null);

  // No synchronous setState before the first await — the component mounts in
  // "loading" and retries keep their current state until the fetch resolves.
  const load = useCallback(async () => {
    try {
      const result = await fetchProductBySlug(slug);
      setProduct(result);
      setState("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState("missing");
      } else {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setState(err instanceof ApiError && err.isOffline ? "offline" : "error");
      }
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, same pattern as ShopIndex
    void load();
  }, [load]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!product) return;

      const tl = gsap.timeline();
      tl.fromTo(
        ".detail-kicker",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
        .fromTo(
          ".detail-title",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".detail-panel > *",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".detail-image",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .fromTo(
          ".detail-body > *",
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".detail-body",
              start: "top 85%",
            },
          },
          "-=0.3"
        );
    },
    { scope: sectionRef, dependencies: [product] }
  );

  /* ── Loading / error / offline / missing states ─────────────── */
  if (state !== "ready" || !product) {
    return (
      <div ref={sectionRef}>
        <div className="min-h-[60vh] pt-40 pb-24 px-6 bg-cream-100">
          <div className="max-w-330 mx-auto flex flex-col items-center gap-4 text-center">
            {state === "loading" && (
              <>
                <Loader2 size={28} className="animate-spin text-brand-primary" aria-hidden="true" />
                <p className="font-sans text-sm text-ink-500">Fetching the product…</p>
              </>
            )}
            {state === "missing" && (
              <>
                <AlertCircle size={28} className="text-brand-primary" aria-hidden="true" />
                <h1 className="font-display text-3xl text-ink-900">Product not found.</h1>
                <p className="font-sans text-sm text-ink-500 max-w-md">
                  This product may have been taken off the shelf. Head back to the shop and
                  see what&rsquo;s available today.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-7 py-3 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  Back to the Shop
                </Link>
              </>
            )}
            {(state === "offline" || state === "error") && (
              <>
                <AlertCircle size={28} className="text-brand-primary" aria-hidden="true" />
                <p className="font-sans text-sm text-ink-700 max-w-md">
                  {state === "offline"
                    ? "The shop is unreachable right now. Check your connection and try again."
                    : errorMsg || "Something went wrong loading this product."}
                </p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
                >
                  <RefreshCw size={13} aria-hidden="true" />
                  Try again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── The product spread ─────────────────────────────────────── */
  return (
    <div ref={sectionRef} className="bg-cream-100">
      <div className="max-w-330 mx-auto px-6 pt-32 md:pt-40 pb-20">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="font-sans text-xs uppercase tracking-[0.15em] text-ink-500"
        >
          <Link href="/shop" className="hover:text-brand-primary transition-colors">
            Shop
          </Link>
          <span className="mx-2 text-ink-900/30">/</span>
          <span className="text-brand-primary font-semibold">{product.category}</span>
        </nav>

        {/* Headline */}
        <p className="detail-kicker mt-8 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-ink-500 font-semibold">
          Marvela Business Enterprise
        </p>
        <h1 className="detail-title mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink-900 max-w-4xl">
          {product.name}
        </h1>

        {/* Image + order panel */}
        <div className="mt-12 grid lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Full-bleed image moment */}
          <div className="detail-image relative aspect-4/3 bg-cream-200 rounded-md overflow-hidden border border-ink-900/10">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL, see ShopIndex note
              <img
                id={`product-image-${product.id}`}
                src={product.imageUrl}
                alt={product.imageAlt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
                <ShoppingBag size={64} strokeWidth={1.25} aria-hidden="true" />
              </div>
            )}
            {!product.inStock && (
              <span className="absolute top-4 left-4 bg-ink-900 text-cream-50 font-sans text-[0.65rem] uppercase tracking-[0.15em] font-semibold px-3 py-1.5 rounded-sm">
                Out of stock
              </span>
            )}
          </div>

          {/* Order panel */}
          <aside className="detail-panel bg-cream-50 border border-ink-900/12 rounded-md p-7 lg:sticky lg:top-28 space-y-6">
            <p className="font-display text-3xl text-ink-900 font-semibold tabular-nums">
              {formatMoney(product.price, product.currency)}
            </p>

            <ProductFacts product={product} />

            <AddToCartButton product={product} className="w-full py-3.5 text-[0.75rem]" />

            {product.selarUrl && (
              <a
                href={product.selarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center justify-center gap-2 w-full border border-ink-900/25 text-ink-900 px-6 py-3 text-[0.7rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
              >
                Buy on Selar
                <ExternalLink
                  size={12}
                  aria-hidden="true"
                  className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                />
              </a>
            )}

            <p className="flex items-start gap-2.5 font-sans text-xs text-ink-500 leading-relaxed">
              <ShieldCheck size={15} className="text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
              Payment is processed securely on Selar&rsquo;s platform — never on this site.
              The price above is an estimate; Selar&rsquo;s listed price is always the
              authoritative one.
            </p>

            <ul className="space-y-2 font-sans text-xs text-ink-500">
              <li className="flex items-center gap-2">
                <Check size={13} className="text-brand-primary" aria-hidden="true" />
                Natural, healthy everyday essentials
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-brand-primary" aria-hidden="true" />
                From Marvela Business Enterprise
              </li>
            </ul>
          </aside>
        </div>

        {/* Reading column: the description */}
        <div className="detail-body max-w-2xl mt-16 md:mt-24 space-y-7">
          <div
            className="font-display text-xl sm:text-2xl leading-snug text-ink-900 border-l-4 border-brand-primary pl-6"
            // Rich text from the admin editor — sanitized on write (server
            // allowlist); plain-text legacy values render unchanged.
            dangerouslySetInnerHTML={{ __html: product.description || "A Marvela essential." }}
          />
          <p className="font-sans text-[1.05rem] leading-[1.85] text-ink-700">
            Every Marvela product is chosen to bring natural, healthy essentials within
            reach of the households and communities ELEOS serves. Add this item to your
            cart and complete the purchase securely on Selar — or reach out and ask us
            about it directly.
          </p>
        </div>

        {/* Route back to the shelf */}
        <div className="mt-16 pt-10 border-t border-ink-900/15">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2.5 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-4 transition-all duration-300"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to the shelf
          </Link>
          <Link
            href="/contact"
            className="group ml-8 inline-flex items-center gap-2.5 text-ink-500 text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:text-brand-primary hover:gap-4 transition-all duration-300"
          >
            Ask about this product
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
