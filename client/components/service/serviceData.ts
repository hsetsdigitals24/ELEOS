/**
 * Shared data for the five service pages under /service/ — the "What We Do"
 * dropdown destinations in the Navbar. Single source of truth so the sidebar
 * nav tabs, hero, and page metadata never drift apart.
 */

export interface ServiceInfo {
  slug: string;
  index: string;
  title: string;
  /** Compact label for the sidebar nav tab. */
  tabLabel: string;
  href: string;
  /** Hero lead paragraph — 1–2 sentences, richer than the card blurb. */
  lead: string;
  /** Card blurb (mirrors WhatWeDoServices). */
  description: string;
  image: string;
  imageAlt: string;
}

export const services: ServiceInfo[] = [
  {
    slug: "advocacy-capacity-building",
    index: "01",
    title: "Advocacy & Capacity Building",
    tabLabel: "Advocacy & Capacity Building",
    href: "/service/advocacy-capacity-building",
    lead: "Our strategic campaigns raise awareness about the intersectionality of food and nutrition security with health, education, and economic development — then equip communities with the skills to act on what they learn.",
    description:
      "Our strategic campaigns raise awareness about the intersectionality of food and nutrition security with health, education, and economic development.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788649258/Advocacy-and-Capacity-building_lf7xmn.jpg",
    imageAlt:
      "Community members engaged in an ELEOS advocacy and capacity-building session",
  },
  {
    slug: "socioeconomic-empowerment-program",
    index: "02",
    title: "Socioeconomic Empowerment Program",
    tabLabel: "Socioeconomic Empowerment",
    href: "/service/socioeconomic-empowerment-program",
    lead: "We implement programs tailored towards uplifting and empowering underprivileged communities — turning skills, resources, and opportunity into durable household livelihoods.",
    description:
      "Implementing programs that are tailored towards uplifting and empowering the underprivileged communities.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Socioeconomic-empowernment-programme_1788618358346_jwlgyv.jpg",
    imageAlt:
      "Participants in an ELEOS socioeconomic empowerment programme",
  },
  {
    slug: "seminars-and-workshops",
    index: "03",
    title: "Seminars & Workshops",
    tabLabel: "Seminars & Workshops",
    href: "/service/seminars-and-workshops",
    lead: "Our interactive forums facilitate discussion, foster collaboration, and unearth pragmatic solutions to contemporary issues in sustainable development.",
    description:
      "Our interactive forums facilitate discussions, foster collaboration, and unearth pragmatic solutions to contemporary issues in sustainable development.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Seminars-and-workshops_1788618358450_uir1f0.jpg",
    imageAlt:
      "Attendees collaborating at an ELEOS seminar or workshop",
  },
  {
    slug: "research-support",
    index: "04",
    title: "Research Support",
    tabLabel: "Research Support",
    href: "/service/research-support",
    lead: "We fuel academic innovation and discovery in the social sciences, humanities, and interdisciplinary studies — standing with researchers from question to publication.",
    description:
      "We fuel academic innovation and discovery in social science, humanities and interdisciplinary studies.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895185/Research_dlafdo.jpg",
    imageAlt: "Researcher at work — placeholder pending documentary photography",
  },
  {
    slug: "journal-publications",
    index: "05",
    title: "Journal Publications",
    tabLabel: "Journal Publications",
    href: "/service/journal-publications",
    lead: "At ERI, we provide adequate support and opportunities to the academia and other researchers to publish their works — rigorous review, editorial care, and a genuine route to readers.",
    description:
      "At ERI, we provide adequate support and opportunities to the academia and other researchers to publish their works.",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895137/Publications_w4vber.jpg",
    imageAlt: "Published journals — placeholder pending documentary photography",
  },
];

export function getService(slug: string): ServiceInfo {
  return services.find((s) => s.slug === slug) ?? services[0];
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  href: string;
  image: string;
}

/* Mirrors the Footer's Recent Posts — the "Latest News" sidebar block. */
export const latestNews: NewsItem[] = [
  {
    id: "news-1",
    title:
      "My Help Lyrics — Written by Precious Gabriel & Bukunmi Adaramola",
    date: "1 January, 2026",
    href: "/blog/my-help-lyrics",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640357/My-Help-600x500_1788618358556_r5g6tu.jpg",
  },
  {
    id: "news-2",
    title: "Advocacy and Capacity Building for Human Security",
    date: "28 December, 2025",
    href: "/service/advocacy-capacity-building",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640358/scent-leaf-image-150x150_1788618358875_sxdhne.jpg",
  },
  {
    id: "news-3",
    title: "Socioeconomic Empowerment Initiatives",
    date: "15 December, 2025",
    href: "/service/socioeconomic-empowerment-program",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640442/Life-plant-image-dry-leafgrowing-150x150_1788618358979_p7h7mv.jpg",
  },
];
