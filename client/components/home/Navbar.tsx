"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, X, PhoneCall, Mail, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import CartBadge from "@/components/home/CartBadge";

interface DropdownLink {
  label: string;
  href: string;
}

interface NavLinkItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownLinks?: DropdownLink[];
}

const navLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Who We Are",
    href: "/who-we-are",
    hasDropdown: true,
    dropdownLinks: [{ label: "FAQ's", href: "/faqs" }],
  },
  {
    label: "What We Do",
    href: "/what-we-do",
    hasDropdown: true,
    dropdownLinks: [
      { label: "Advocacy & Capacity Building", href: "/service/advocacy-capacity-building" },
      { label: "Socioeconomic Empowerment Program", href: "/service/socioeconomic-empowerment-program" },
      { label: "Seminars & Workshops", href: "/service/seminars-and-workshops" },
      { label: "Research Support", href: "/service/research-support" },
      { label: "Journal Publications", href: "/service/journal-publications" },
    ],
  },
  {
    label: "Our Subsidiaries",
    href: "#subsidiaries",
    hasDropdown: true,
    dropdownLinks: [
      { label: "His Story Tellers Media", href: "/his-story-tellers-media" },
      { label: "Marvela Business Enterprise", href: "/marvela-business-enterprise" },
    ],
  },
  {
    label: "Updates",
    href: "#updates",
    hasDropdown: true,
    dropdownLinks: [
      { label: "Blogs", href: "/blog" },
      { label: "Videos", href: "/videos" },
    ],
  },
  {
    label: "Events",
    href: "",
    hasDropdown: true,
    dropdownLinks: [
      { label: "Upcoming Events", href: "/upcoming" },
      { label: "Live Audio Broadcast", href: "/live-audio-broadcast" },
      { label: "Live Video Broadcast", href: "/live-video-broadcast" },
    ],
  },
  {
    label: "Shop",
    href: "/shop",
  },
  { label: "Contact Us", href: "/contact" },
];

// Flattened list of every navigable page, used by the search overlay
const searchableItems = navLinks.flatMap((link) => [
  { label: link.label, href: link.href },
  ...(link.dropdownLinks ?? []).map((d) => ({
    label: `${d.label} — ${link.label}`,
    href: d.href,
  })),
]);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? searchableItems.filter((item) => item.label.toLowerCase().includes(query))
    : navLinks.map((link) => ({ label: link.label, href: link.href }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll, blur background contents, and handle Escape key
  useEffect(() => {
    const mainEl = document.querySelector("main");
    const overlayActive = mobileOpen || searchOpen;

    if (overlayActive) {
      document.body.style.overflow = "hidden";
      if (mainEl) {
        mainEl.style.transition = "filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        mainEl.style.filter = "blur(10px)";
        mainEl.style.transform = "scale(0.985)";
        mainEl.style.transformOrigin = "center top";
      }
    } else {
      document.body.style.overflow = "";
      if (mainEl) {
        mainEl.style.filter = "none";
        mainEl.style.transform = "none";
      }
      setExpandedMobileMenu(null);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      if (mainEl) {
        mainEl.style.filter = "none";
        mainEl.style.transform = "none";
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, searchOpen]);

  // Focus the search input once the overlay has settled in
  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [searchOpen]);

  const toggleMobileSubmenu = (href: string) => {
    setExpandedMobileMenu((prev) => (prev === href ? null : href));
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 w-full transition-all duration-500 ${
        mobileOpen ? "z-100" : "z-50"
      } ${
        scrolled && !mobileOpen
          ? "bg-white/95 text-ink-700 backdrop-blur-md py-3 shadow-xl border-b border-ink-900/10"
          : "bg-linear-to-b from-black/60 via-black/30 to-transparent py-4 md:py-5"
      }`}
    >
      <nav className="max-w-330 mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl md:text-2xl text-ink-950 tracking-tight flex items-center gap-3 relative z-120"
        >
          <Image
            src="/brand/logo.png"
            alt="ELEOS Logo"
            width={50}
            height={50}
            className="w-auto h-9 sm:h-11 object-contain drop-shadow-md"
            priority
          />
        </Link>

        {/* Desktop links with DaisyUI dropdown */}
        <ul className="hidden lg:flex items-center gap-7 xl:gap-9">
          {navLinks.map((link) => (
            <li
              key={link.href}
              className={`relative ${link.hasDropdown ? "dropdown dropdown-hover dropdown-bottom" : ""}`}
            >
              <Link             
                href={link.href}
                className={`${scrolled && !mobileOpen ? "text-ink-700" : "text-white"} hover:text-brand-primary flex items-center gap-1.5 text-[0.8rem] uppercase tracking-[0.14em] font-sans font-medium transition-colors duration-300 py-2 group`}
              >
                <span>{link.label}</span>
                {link.hasDropdown && (
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-300 opacity-70 group-hover:rotate-180 group-hover:text-brand-primary"
                  />
                )}
              </Link>

              {link.hasDropdown && (
                <ul
                  tabIndex={-1}
                  className="dropdown-content menu bg-white text-ink-900 border-t-4 border-brand-primary rounded-b-lg z-50 mt-2 w-64 p-2 shadow-2xl before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-[''] animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  {link.dropdownLinks?.map((dropdownLink) => (
                    <li key={dropdownLink.href}>
                      <Link
                        href={dropdownLink.href}
                        className="block px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-ink-900 hover:bg-brand-50 hover:text-brand-primary rounded-md transition-colors"
                      >
                        {dropdownLink.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Action Icons: Search + Cart */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="group relative w-10 h-10 flex items-center justify-center rounded-full border border-ink-900/10 bg-white/70 text-ink-700 backdrop-blur-md transition-all duration-300 hover:border-brand-primary/60 hover:text-brand-primary hover:-translate-y-0.5 active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Search
              size={17}
              className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12"
            />
          </button>
          <Link
            href="/cart"
            aria-label="View cart"
            data-cart-icon
            className="group relative w-10 h-10 flex items-center justify-center rounded-full border border-ink-900/10 bg-white/70 text-ink-700 backdrop-blur-md transition-all duration-300 hover:border-brand-primary/60 hover:text-brand-primary hover:-translate-y-0.5 active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <ShoppingBag
              size={17}
              className="transition-all duration-300 group-hover:scale-110"
            />
            <CartBadge />
          </Link>
        </div>

        {/* Mobile Actions: Search + Cart sit BEFORE the menu button */}
        <div
          className={`lg:hidden flex items-center gap-2.5 relative z-120 transition-all duration-500 ${
            scrolled || mobileOpen
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none -translate-y-2"
          }`}
        >
          <button
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            aria-label="Search"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/90 border border-ink-900/10 text-ink-900 backdrop-blur-md transition-all duration-300 hover:border-brand-primary/60 hover:text-brand-primary active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Search size={17} className="transition-transform duration-300 active:scale-90" />
          </button>
          <Link
            href="/cart"
            aria-label="View cart"
            data-cart-icon
            className="relative w-11 h-11 flex items-center justify-center rounded-full bg-white/90 border border-ink-900/10 text-ink-900 backdrop-blur-md transition-all duration-300 hover:border-brand-primary/60 hover:text-brand-primary active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <ShoppingBag size={17} className="transition-transform duration-300 active:scale-90" />
            <CartBadge />
          </Link>

          {/* Animated Mobile Hamburger / Close Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-120 w-11 h-11 flex flex-col items-center justify-center rounded-full bg-white/90 border border-ink-900/10 hover:border-brand-primary/50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-500 active:scale-90 shadow-xl backdrop-blur-md"
            aria-label={mobileOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            <div className="w-5 h-4 relative flex flex-col justify-between items-center">
              {/* Top bar */}
              <span
                className={`h-0.5 w-5 bg-ink-900 rounded-full transition-all duration-300 ease-out origin-center ${
                  mobileOpen ? "rotate-45 translate-y-1.75 bg-brand-primary" : ""
                }`}
              />
              {/* Middle bar */}
              <span
                className={`h-0.5 w-5 bg-ink-900 rounded-full transition-all duration-200 ease-out ${
                  mobileOpen ? "opacity-0 scale-x-0" : "opacity-100"
                }`}
              />
              {/* Bottom bar */}
              <span
                className={`h-0.5 w-5 bg-ink-900 rounded-full transition-all duration-300 ease-out origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-1.75 bg-brand-primary" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Backdrop Overlay with blur and transparency */}
      <div
        className={`lg:hidden fixed inset-0 w-screen h-screen z-100 transition-all duration-500 ease-out ${
          mobileOpen
            ? "opacity-100 pointer-events-auto backdrop-blur-2xl bg-ink-950/30"
            : "opacity-0 pointer-events-none backdrop-blur-none bg-transparent"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        {/* Mobile Nav Container: Solid opaque dark background (not transparent) */}
        <div
          ref={drawerRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 w-full max-w-sm sm:max-w-md h-screen bg-white border-l border-ink-900/10 shadow-2xl flex flex-col justify-between transition-all duration-500 ease-out transform ${
            mobileOpen
              ? "translate-x-0 opacity-100 shadow-[0_0_60px_rgba(0,0,0,0.18)]"
              : "translate-x-full opacity-0"
          }`}
        >
          {/* Drawer Nav Links (All links rendered) */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-1 mt-14 sm:mt-16">
            {navLinks.map((link, idx) => {
              const isExpanded = expandedMobileMenu === link.href;

              return (
                <div
                  key={link.href}
                  className={`transition-all duration-400 ease-out ${
                    mobileOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-6 opacity-0"
                  }`}
                  style={{
                    transitionDelay: mobileOpen ? `${idx * 40 + 50}ms` : "0ms",
                  }}
                >
                  <div className="flex items-center justify-between py-2.5 border-b border-ink-900/8 dropdown">
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm sm:text-base uppercase tracking-[0.15em] font-sans font-medium text-ink-900 hover:text-brand-primary transition-colors flex-1"
                    >
                      {link.label}
                    </Link>

                    {link.hasDropdown && (
                      <button
                        onClick={() => toggleMobileSubmenu(link.href)}
                        className="p-1.5 text-ink-500 hover:text-brand-primary hover:bg-ink-900/5 rounded-md transition-colors"
                        aria-label={`Toggle ${link.label} sub-items`}
                      >
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-300 ${
                            isExpanded ? "rotate-90 text-brand-primary" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Accordion Submenu for Mobile */}
                  {link.hasDropdown && (
                    <div
                      className={`grid transition-all duration-300 ease-in-out pl-3 bg-cream-100 rounded-md my-1.5 ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100 py-2 border-l-2 border-brand-primary"
                          : "grid-rows-[0fr] opacity-0 py-0"
                      }`}
                    >
                      <div className="overflow-hidden space-y-2">
                        {link.dropdownLinks?.map((subLink) => (
                          <Link
                            key={subLink.href}
                            href={subLink.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-1.5 px-2 text-xs uppercase tracking-wider text-ink-700 hover:text-brand-primary hover:bg-brand-50 rounded transition-colors font-sans font-medium"
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drawer Footer / CTA */}
          <div className="p-5 border-t border-ink-900/10 bg-cream-100 space-y-3 shrink-0">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-md bg-brand-primary text-cream-50 font-sans font-semibold uppercase text-xs tracking-widest hover:bg-brand-hover shadow-lg transition-all duration-300 active:scale-98"
            >
              <PhoneCall size={14} />
              <span>Get In Touch</span>
            </Link>
            <div className="flex items-center justify-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <Mail size={12} /> info@eleosresearch.org
              </span>
            </div>
          </div>
        </div>
      </div>

    </header>

    {/* Search Overlay: editorial full-screen search. Rendered OUTSIDE <header>:
        the header's scrolled backdrop-blur-md becomes a containing block for
        fixed descendants, which would otherwise collapse this overlay to the
        header's own box. */}
    <div
      className={`fixed inset-0 z-200 transition-opacity duration-500 ease-out ${
        searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setSearchOpen(false)}
    >
      {/* Bright backdrop stack: blurred page content under a near-white
          field, a soft vignette, and a faint brand-red ambient glow.
          Readable over any content. */}
      <div aria-hidden="true" className="absolute inset-0 backdrop-blur-2xl bg-[rgba(253,252,250,0.5)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(253,252,250,0.92)] shadow-[inset_0_0_160px_rgba(20,20,20,0.06)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(227,34,28,0.10),transparent_65%)]"
      />

      <div className="relative h-full flex items-start justify-center pt-24 sm:pt-32 px-5 overflow-y-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl transition-all duration-500 ease-out ${
            searchOpen ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: searchOpen ? "80ms" : "0ms" }}
        >
          {/* Label + Close */}
          <div className="flex items-center justify-between mb-6">
            <span className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.25em] font-sans font-semibold text-brand-primary">
              <span className="h-px w-8 bg-brand-primary" />
              Search ELEOS
            </span>
            <button
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition-all duration-300 hover:text-brand-primary hover:border-brand-primary/50 hover:rotate-90 active:scale-90 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <X size={17} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search
              size={20}
              className="absolute left-0 top-1.5 sm:top-2.5 text-ink-500/60 transition-colors duration-300 group-focus-within:text-brand-primary"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search the site"
              className="w-full bg-transparent border-0 border-b-2 border-ink-900/20 focus:border-brand-primary outline-none font-display text-2xl sm:text-4xl text-ink-950 placeholder:text-ink-500/40 caret-brand-primary pb-3 sm:pb-4 pl-8 sm:pl-9 transition-colors duration-300"
            />
          </div>

          {/* Results */}
          <div className="mt-6 max-h-[50vh] overflow-y-auto space-y-0.5 pr-1">
            {searchResults.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className={`group flex items-center justify-between gap-4 px-3 py-3 border-b border-ink-900/5 rounded-sm transition-all duration-300 ease-out hover:bg-brand-50 hover:translate-x-1.5 ${
                  searchOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: searchOpen ? `${Math.min(i, 8) * 35 + 150}ms` : "0ms" }}
              >
                <span className="text-sm sm:text-base font-sans font-medium text-ink-700 group-hover:text-ink-950 transition-colors duration-300">
                  {item.label}
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-brand-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                />
              </Link>
            ))}
            {searchResults.length === 0 && (
              <p className="px-3 py-6 text-sm font-sans text-ink-500">
                No results for &ldquo;{searchQuery.trim()}&rdquo; — try &ldquo;research&rdquo;, &ldquo;events&rdquo; or
                &ldquo;media&rdquo;.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
