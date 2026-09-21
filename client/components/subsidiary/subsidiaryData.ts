/**
 * Shared data for the two subsidiary pages — His Story Tellers Media and
 * Marvela Business Enterprise, the "Our Subsidiaries" dropdown destinations
 * in the Navbar. Single source of truth so the hero, cross-links ("Next
 * Subsidiary"), and page metadata never drift apart.
 */

export interface SubsidiaryInfo {
  slug: string;
  title: string;
  /** Compact label for the hero breadcrumb. */
  tabLabel: string;
  href: string;
  /** Hero eyebrow — sits above the display title. */
  eyebrow: string;
  /** Hero tagline — one line, richer than the card blurb. */
  tagline: string;
  image: string;
  imageAlt: string;
}

export const subsidiaries: SubsidiaryInfo[] = [
  {
    slug: "his-story-tellers-media",
    title: "His Story Tellers Media",
    tabLabel: "His Story Tellers Media",
    href: "/his-story-tellers-media",
    eyebrow: "A Subsidiary of Eleos",
    tagline:
      "A creative media and film production subsidiary committed to producing enriching movies and media content that inform, inspire, and shape societal values.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/WhatsApp-Image-2026-01-01-at-7.54.05-PM_1788618357926_dn5qqo.jpg",
    imageAlt:
      "His Story Tellers Media — creative media and film production still",
  },
  {
    slug: "marvela-business-enterprise",
    title: "Marvela Business Enterprise",
    tabLabel: "Marvela Business Enterprise",
    href: "/marvela-business-enterprise",
    eyebrow: "A Subsidiary of Eleos",
    tagline: "Your Trusted Source for Healthy Living.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640358/pexels-ifreestock-616833-1-scaled_1788618358031_ddchem.jpg",
    imageAlt:
      "Marvela Business Enterprise — natural and healthy everyday essentials",
  },
];

export function getSubsidiary(slug: string): SubsidiaryInfo {
  return (
    subsidiaries.find((s) => s.slug === slug) ?? subsidiaries[0]
  );
}
