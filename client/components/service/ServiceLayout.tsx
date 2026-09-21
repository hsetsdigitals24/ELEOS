import CtaBanner from "@/components/home/CtaBanner";
import ServiceHero from "./ServiceHero";
import ServiceSidebar from "./ServiceSidebar";
import { getService } from "./serviceData";

interface ServiceLayoutProps {
  /** Slug of the active service — drives the sidebar's active nav tab. */
  slug: string;
  /** The page's editorial body — the only part that changes per service. */
  children: React.ReactNode;
}

/**
 * Shared two-column shell for the five /service/ pages: full-bleed chapter
 * hero, sticky left sidebar (nav tabs, Latest News, Get in Touch), main
 * content column on the right, then the site-wide CTA banner.
 *
 * On mobile the sidebar's nav tabs render above the content and its
 * news/contact blocks fall below it (see ordering in ServiceSidebar).
 */
export default function ServiceLayout({
  slug,
  children,
}: ServiceLayoutProps) {
  const service = getService(slug);

  return (
    <div className="bg-cream-100">
      <ServiceHero service={service} />

      <div className="max-w-330 mx-auto px-6 py-16 md:py-24 flex max-lg:flex-col gap-10 lg:gap-14">
        <ServiceSidebar activeSlug={slug} />

        {/* Main content column — right on desktop, between tabs and sidebar
            blocks on mobile */}
        <article className="min-w-0 flex-1 lg:order-2 max-lg:order-2">
          {children}
        </article>
      </div>

      <CtaBanner />
    </div>
  );
}
