"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  X,
  Mail,
  Phone,
  Clock,
  MapPin,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Layers,
  MessageSquare,
} from "lucide-react";
import FaqHero from "@/components/faqs/FaqHero";
import FaqAccordionItem from "@/components/faqs/FaqAccordionItem";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "@/components/faqs/faqData";
import type { FaqCategoryKey } from "@/types/faqs";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MainFaqs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategoryKey>("all");
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({
    "faq-1": true, // open first by default
  });

  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredItems.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItemIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItemIds({});
  };

  // Re-animate list on category switch or search
  useGSAP(
    () => {
      if (!listRef.current) return;
      gsap.fromTo(
        ".faq-item-card",
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    },
    { dependencies: [activeCategory, searchQuery], scope: listRef }
  );

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* 1. Hero Section */}
      <FaqHero />

      {/* 2. Main Content Area */}
      <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-330 mx-auto">
          {/* Controls Bar: Search & Category Chips */}
          <div className="mb-10 sm:mb-12">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-cream-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-5">
              {/* Search Box */}
              <div className="relative w-full md:w-80 lg:w-96">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or keywords..."
                  className="w-full pl-10 pr-9 py-2.5 bg-cream-50 border border-cream-200 rounded-xl font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 p-0.5 rounded-full"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-center w-full md:w-auto">
                {FAQ_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3.5 py-1.5 rounded-xl font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-brand-primary text-cream-50 shadow-md shadow-brand-primary/20 scale-102"
                          : "bg-cream-50 text-ink-600 hover:bg-cream-200/60 hover:text-ink-900 border border-cream-200/60"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-header info bar: count + expand/collapse buttons */}
            <div className="mt-4 px-2 flex items-center justify-between text-xs text-ink-500 font-sans">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                Showing <strong className="text-ink-800">{filteredItems.length}</strong> questions
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="hover:text-brand-primary transition-colors cursor-pointer"
                >
                  Expand all
                </button>
                <span className="text-ink-400">•</span>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="hover:text-brand-primary transition-colors cursor-pointer"
                >
                  Collapse all
                </button>
              </div>
            </div>
          </div>

          {/* 3. Grid: Accordion Left + Sidebar Right */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Accordion list */}
            <div ref={listRef} className="lg:col-span-8 space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <FaqAccordionItem
                    key={item.id}
                    item={item}
                    index={index}
                    isOpen={!!openItemIds[item.id]}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))
              ) : (
                /* Empty state when search yields no match */
                <div className="bg-white rounded-2xl p-10 text-center border border-cream-200 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-primary flex items-center justify-center mx-auto mb-4">
                    <HelpCircle size={32} />
                  </div>
                  <h3 className="font-display text-xl text-ink-900 mb-2">
                    No answers match your search
                  </h3>
                  <p className="font-sans text-sm text-ink-500 max-w-md mx-auto mb-6">
                    We couldn&apos;t find any questions matching &ldquo;
                    <span className="text-brand-primary font-semibold">
                      {searchQuery}
                    </span>
                    &rdquo;. Try another term or connect with our support desk.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="px-4 py-2 bg-cream-100 text-ink-700 hover:bg-cream-200 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
                    >
                      Clear Search
                    </button>
                    <Link
                      href="/contact"
                      className="px-4 py-2 bg-brand-primary text-cream-50 hover:bg-brand-hover rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
                    >
                      Ask Us Directly
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Quick Help & Insights */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              {/* Card 1: Have Any Other Questions? */}
              <div className="bg-white rounded-2xl p-6 border border-cream-200/90 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.06)] relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                  <MessageSquare size={20} />
                </div>

                <h3 className="font-display text-xl text-ink-900 mb-2">
                  Need Personal Guidance?
                </h3>
                <p className="font-sans text-sm text-ink-600 leading-relaxed mb-6">
                  Can&apos;t find the specific answer you&apos;re looking for? Our research desk and community team are here to assist you.
                </p>

                <div className="space-y-3.5 border-t border-cream-100 pt-5 text-xs font-sans">
                  {/* Email */}
                  <a
                    href="mailto:eleosresearchinn@gmail.com"
                    className="flex items-center gap-3 text-ink-700 hover:text-brand-primary transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-primary transition-colors shrink-0">
                      <Mail size={14} />
                    </div>
                    <span className="truncate">eleosresearchinn@gmail.com</span>
                  </a>

                  {/* Phone */}
                  <a
                    href="tel:+2348122765292"
                    className="flex items-center gap-3 text-ink-700 hover:text-brand-primary transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-primary transition-colors shrink-0">
                      <Phone size={14} />
                    </div>
                    <span>(+234) 8122765292</span>
                  </a>

                  {/* Location */}
                  <div className="flex items-start gap-3 text-ink-700">
                    <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-ink-500 shrink-0 mt-0.5">
                      <MapPin size={14} />
                    </div>
                    <span className="leading-snug">
                      Maranatha Complex, Behind T & K Restaurant, Off University Road, Tanke, Ilorin
                    </span>
                  </div>

                  {/* Opening hours */}
                  <div className="flex items-start gap-3 text-ink-700">
                    <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-ink-500 shrink-0 mt-0.5">
                      <Clock size={14} />
                    </div>
                    <span className="leading-snug">
                      Mon – Fri: 9:00am – 4:00pm (GMT)
                    </span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-primary text-cream-50 font-sans text-xs uppercase tracking-wider font-semibold hover:bg-brand-hover transition-all duration-300 shadow-md group"
                >
                  <span>Contact Our Team</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

             
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
