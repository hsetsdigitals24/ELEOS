"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types/faqs";

interface FaqAccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

export default function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: FaqAccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Handle open/close with GSAP
  useEffect(() => {
    const content = contentRef.current;
    const icon = iconRef.current;
    if (!content || !icon) return;

    if (isOpen) {
      // Animate open
      gsap.killTweensOf(content);
      gsap.killTweensOf(icon);

      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        }
      );

      gsap.to(icon, {
        rotate: 180,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      // Animate closed
      gsap.killTweensOf(content);
      gsap.killTweensOf(icon);

      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });

      gsap.to(icon, {
        rotate: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  const categoryLabels: Record<string, string> = {
    general: "About ERI",
    nutrition: "Food & Nutrition",
    research: "Research",
    advocacy: "Partnerships",
  };

  return (
    <div
      className={`faq-item-card rounded-2xl border transition-all duration-300 overflow-hidden ${
        isOpen
          ? "bg-white border-brand-primary/30 shadow-[0_12px_35px_-8px_rgba(227,34,28,0.08)] ring-1 ring-brand-primary/20"
          : "bg-white/80 border-cream-200/90 shadow-sm hover:bg-white hover:border-cream-300 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-6 py-5 sm:py-6 flex items-center justify-between gap-4 cursor-pointer select-none group"
      >
        <div className="flex items-start gap-4">
          {/* Index Counter */}
          <span
            className={`font-display text-sm font-semibold tracking-wider shrink-0 mt-0.5 transition-colors duration-300 ${
              isOpen ? "text-brand-primary" : "text-ink-400 group-hover:text-brand-primary"
            }`}
          >
            {index < 9 ? `0${index + 1}` : index + 1}
          </span>

          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-sans tracking-widest font-semibold text-brand-primary bg-brand-50 border border-brand-100/60 px-2 py-0.5 rounded-full">
                {categoryLabels[item.category] || item.category}
              </span>
              {item.featured && (
                <span className="text-[10px] uppercase font-sans tracking-widest font-medium text-ink-500 bg-cream-100 px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </div>

            <h3
              className={`font-display text-base sm:text-lg lg:text-xl font-medium transition-colors duration-300 ${
                isOpen ? "text-brand-primary" : "text-ink-900 group-hover:text-brand-primary"
              }`}
            >
              {item.question}
            </h3>
          </div>
        </div>

        {/* Toggle Icon with GSAP rotation */}
        <div
          ref={iconRef}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOpen
              ? "bg-brand-primary text-cream-50 shadow-[0_0_12px_rgba(227,34,28,0.4)]"
              : "bg-cream-100 text-ink-600 group-hover:bg-brand-50 group-hover:text-brand-primary"
          }`}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Accordion Content animated by GSAP */}
      <div ref={contentRef} className="h-0 overflow-hidden opacity-0">
        <div className="px-6 pb-6 pt-2 pl-14 sm:pl-16 border-t border-cream-100">
          <p className="font-sans text-sm sm:text-base text-ink-700 leading-relaxed">
            {item.answer}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-sans text-ink-400 font-medium">
                Related:
              </span>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-sans text-ink-600 bg-cream-100/80 px-2.5 py-0.5 rounded-md hover:bg-cream-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
