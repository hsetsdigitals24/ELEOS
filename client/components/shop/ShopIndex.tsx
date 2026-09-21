"use client";

// components/shop/ShopIndex.tsx — the Marvela shop front: the standard
// hero, a ruled shelf of products fetched from the API, category chips
// that re-cut the page like the blog's editor's desk, and Add-to-Cart
// buttons that feed the localStorage cart. Checkout itself never happens
// here — every product carries its Selar link.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertCircle, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { fetchProductCategories, fetchProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/formatMoney";
import type { ProductItem } from "@/types/product";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type LoadState = "loading" | "ready" | "offline" | "error";

/** One shelf card. Product images are admin-supplied arbitrary URLs, so a
 *  plain <img> keeps them working without remote-pattern maintenance. The
 *  image and title route to the product's detail page; the Add-to-Cart
 *  control sits outside that link so both actions stay one click apart. */
function ProductCard({ product }: { product: ProductItem }) {
  return (
    <article className="shop-card group flex flex-col border border-ink-900/12 bg-cream-50 rounded-md overflow-hidden hover:border-brand-primary/50 hover:shadow-[0_10px_40px_rgba(20,20,20,0.08)] transition-all duration-300">
      {/* Image band — opens the product's detail page */}
      <Link
        href={`/shop/${product.slug}`}
        aria-label={`View details of ${product.name}`}
        className="relative aspect-4/3 bg-cream-200 overflow-hidden block"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL, see file note
          <img
            id={`product-image-${product.id}`}
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
            <ShoppingBag size={40} strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 bg-ink-900 text-cream-50 font-sans text-[0.65rem] uppercase tracking-[0.15em] font-semibold px-3 py-1.5 rounded-sm">
            Out of stock
          </span>
        )}
      </Link>

      {/* Details band */}
      <div className="flex flex-col grow p-5">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brand-primary font-semibold">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`} className="block">
          <h3 className="mt-2 font-display text-xl leading-snug text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <div
            className="mt-2 font-sans text-sm text-ink-500 leading-relaxed line-clamp-2"
            // Rich text from the admin editor — sanitized on write (server
            // allowlist); plain-text legacy values render unchanged.
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <span className="font-display text-lg text-ink-900 font-semibold tabular-nums">
            {formatMoney(product.price, product.currency)}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}

export default function ShopIndex() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(
    async (category: string | null, pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setState("loading");

      try {
        const [result, cats] = await Promise.all([
          fetchProducts({ category: category ?? undefined, page: pageNum, limit: 12 }),
          append ? Promise.resolve(null) : fetchProductCategories(),
        ]);
        setProducts((prev) => (append ? [...prev, ...result.items] : result.items));
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        if (cats) setCategories(cats.categories);
        setState("ready");
      } catch (err) {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setState(err instanceof ApiError && err.isOffline ? "offline" : "error");
      } finally {
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    void load(null, 1, false);
  }, [load]);

  const selectCategory = (name: string | null) => {
    setActiveCategory(name);
    void load(name, 1, false);
  };

  const productCountLabel = useMemo(() => {
    if (state !== "ready") return "";
    const total = categories.find((c) => c.name === activeCategory)?.count ?? products.length;
    return `${total} ${total === 1 ? "product" : "products"}`;
  }, [state, categories, activeCategory, products.length]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".shop-grid > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".shop-grid",
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [products] }
  );

  return (
    <div ref={sectionRef}>
      <PageHero
        id="shop-hero"
        title="Shop"
        breadcrumb="Shop"
      />

      <div className="bg-cream-100 px-6 py-10 md:py-14">
        <div className="max-w-330 mx-auto">
          {/* Editor's desk: category chips */}
          <div className="flex flex-wrap gap-2 pb-8 border-b border-ink-900/15">
            <button
              onClick={() => selectCategory(null)}
              className={`font-sans text-xs uppercase tracking-[0.12em] font-semibold px-3.5 py-2 rounded-sm border transition-colors duration-300 ${
                activeCategory === null
                  ? "bg-brand-primary text-cream-50 border-brand-primary"
                  : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  selectCategory(activeCategory === category.name ? null : category.name)
                }
                className={`font-sans text-xs uppercase tracking-[0.12em] font-semibold px-3.5 py-2 rounded-sm border transition-colors duration-300 ${
                  activeCategory === category.name
                    ? "bg-brand-primary text-cream-50 border-brand-primary"
                    : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                {category.name}
                <span className="ml-1.5 opacity-60">{category.count}</span>
              </button>
            ))}
          </div>

          {/* Loading / error / offline states */}
          {state === "loading" && (
            <div className="py-20 flex flex-col items-center gap-4 text-ink-500">
              <Loader2 size={28} className="animate-spin text-brand-primary" aria-hidden="true" />
              <p className="font-sans text-sm">Stocking the shelf…</p>
            </div>
          )}

          {(state === "offline" || state === "error") && (
            <div className="py-20 flex flex-col items-center gap-4 text-center">
              <AlertCircle size={28} className="text-brand-primary" aria-hidden="true" />
              <p className="font-sans text-sm text-ink-700 max-w-md">
                {state === "offline"
                  ? "The shop is unreachable right now. Check your connection and try again."
                  : errorMsg || "Something went wrong loading the shop."}
              </p>
              <button
                type="button"
                onClick={() => void load(activeCategory, 1, false)}
                className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
              >
                <RefreshCw size={13} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {/* The shelf */}
          {state === "ready" && (
            <>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold py-6">
                {productCountLabel}
              </p>
              {products.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="font-display text-2xl text-ink-900">
                    The shelf is being stocked.
                  </p>
                  <p className="mt-3 font-sans text-sm text-ink-500 max-w-md mx-auto">
                    New Marvela products are on their way. Check back soon — or reach out and
                    ask what&rsquo;s available today.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
                  >
                    Ask about products
                  </Link>
                </div>
              ) : (
                <div className="shop-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Load more */}
              {page < totalPages && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => void load(activeCategory, page + 1, true)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2.5 border border-ink-900/25 text-ink-900 px-7 py-3 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                    Load more products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Checkout note — payment happens on Selar ────────────── */}
      <section className="bg-cream-50 border-t border-ink-900/10 py-14 px-6">
        <div className="max-w-330 mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-sans text-sm text-ink-500 leading-relaxed max-w-2xl text-center sm:text-left">
            Add what you need to your cart, then{" "}
            <span className="text-ink-900 font-semibold">proceed to Selar</span> to complete
            your purchase — payment is processed securely on Selar&rsquo;s platform, never on
            this site.
          </p>
          <Link
            href="/cart"
            className="shrink-0 inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
          >
            <ShoppingBag size={15} aria-hidden="true" />
            View Cart
          </Link>
        </div>
      </section>
    </div>
  );
}
