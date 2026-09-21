// types/home.ts — Content shape definitions for the home page.
// Hardcoded data for now; structured so it's trivial to swap for API-fetched data later.

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  /** Part of headline to underline in brand red */
  highlightedPhrase?: string;
  body: string;
  ctas: { label: string; href: string; primary: boolean }[];
  image: string;
}

export interface OpeningHoursEntry {
  days: string;
  hours: string;
}

export interface SubsidiaryCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  iconType: string;
  image: string;
  href: string;
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  iconType: string;
}

export interface BlogPreview {
  id: string;
  title: string;
  date: string;
  author: string;
  categories: string[];
  excerpt: string;
  image: string;
  href: string;
}

export interface VideoPreview {
  id: string;
  title: string;
  duration: string;
  /** Display date, e.g. "24 September 2024" — the homepage only shows recent videos. */
  date: string;
  thumbnail: string;
  href: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  image?: string;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  badge?: string;
}

export interface FooterRecentPost {
  id: string;
  title: string;
  date: string;
  href: string;
  imageLink: string;
}