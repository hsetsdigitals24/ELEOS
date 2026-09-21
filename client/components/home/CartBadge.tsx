"use client";

// components/home/CartBadge.tsx — the live item count riding the navbar's
// cart icon. It reads localStorage as an external store (hydrating to 0 on
// the server), keeps itself in step with every add/remove anywhere on the
// site (lib/cart broadcasts a change event), and pops when the count grows
// so the Add-to-Cart moment has a clear landing.

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cartCount, onCartChange } from "@/lib/cart";

export default function CartBadge() {
  // localStorage is the external store; onCartChange is its subscription.
  // The server snapshot is 0 so hydration markup matches, then the badge
  // appears once the real count is read client-side.
  const count = useSyncExternalStore(onCartChange, cartCount, () => 0);

  const prevCount = useRef(count);
  const badgeRef = useRef<HTMLSpanElement>(null);

  // Pop the badge whenever the count grows — the landing half of the
  // fly-to-cart animation. CSS class swap keeps it cheap and GSAP-free.
  useEffect(() => {
    const grew = count > prevCount.current;
    prevCount.current = count;
    if (!grew) return;

    const el = badgeRef.current;
    if (!el) return;
    el.classList.remove("cart-badge-pop");
    // Force a reflow so the animation can restart on rapid re-adds.
    void el.offsetWidth;
    el.classList.add("cart-badge-pop");
  }, [count]);

  if (count === 0) return null;

  return (
    <span
      ref={badgeRef}
      aria-label={`${count} ${count === 1 ? "item" : "items"} in cart`}
      className="cart-badge absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-brand-primary text-cream-50 font-sans text-[0.65rem] font-bold tabular-nums pointer-events-none shadow-md border-2 border-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
