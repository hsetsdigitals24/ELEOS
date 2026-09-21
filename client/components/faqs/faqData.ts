import type { FaqItem, FaqCategory } from "@/types/faqs";

export const FAQ_CATEGORIES: FaqCategory[] = [
  { key: "all", label: "All Questions" },
  { key: "general", label: "About ERI" },
  { key: "nutrition", label: "Food & Nutrition" },
  { key: "research", label: "Research & Publications" },
  { key: "advocacy", label: "Partnerships & Support" },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is ELEOS Research Innovations (ERI)?",
    category: "general",
    featured: true,
    answer:
      "ERI is a human security platform dedicated to advancing food and nutrition security through advocacy, capacity-building, research support, and publications.",
    tags: ["ERI", "Mission", "Overview"],
  },
  {
    id: "faq-2",
    question: "How does ERI promote food and nutrition security?",
    category: "nutrition",
    featured: true,
    answer:
      "We use strategic advocacy, capacity-building initiatives, socioeconomic empowerment programs, and educational seminars to promote food and nutrition security.",
    tags: ["Food Security", "Nutrition", "Methodology"],
  },
  {
    id: "faq-3",
    question: "Can ERI support or collaborate on my research project?",
    category: "research",
    featured: true,
    answer:
      "Yes, ERI provides experienced support in  research and writing,",
    tags: ["Research", "Collaboration", "Academia"],
  },
  {
    id: "faq-4",
    question: "What is the Family Nutrition Support Program (FNSP)?",
    category: "nutrition",
    answer:
      "The Family Nutrition Support Program (FNSP) is our flagship grassroots initiative providing vulnerable households with balanced food baskets, nutrient fortification guidance, and ongoing dietary counseling. Through FNSP, we help families break the cycle of malnutrition while establishing sustainable, homegrown food practices.",
    tags: ["FNSP", "Family", "Community"],
  },
  {
    id: "faq-5",
    question: "Where is ERI located and what are your official opening hours?",
    category: "general",
    answer:
      "Our main office is situated at TLAC Office Complex, Maranatha Tent, Behind Offa Road, Ilorin, Kwara State, Nigeria. We are open Monday through Friday from 9:00 AM to 4:00 PM (GMT), and on Saturdays and Public Holidays from 10:00 AM to 4:00 PM. We are closed on Sundays.",
    tags: ["Location", "Office Hours", "Contact"],
  },
  {
    id: "faq-6",
    question: "How can individuals or corporate donors partner with or support ERI?",
    category: "advocacy",
    answer:
      "You can support our interventions through research sponsorship, donor funding for our Family Nutrition Support Program, or voluntary expertise. Official contributions can be made to our dedicated Zenith Bank account (Account Number: 1229045764) or by reaching out directly to our partnership desk at eleosresearchinn@gmail.com.",
    tags: ["Donation", "Partnership", "Support"],
  },
  {
    id: "faq-7",
    question: "What practical guidance does ERI provide on spices and natural ingredients?",
    category: "nutrition",
    answer:
      "We advocate for healthy culinary transitions—substituting synthetic seasonings and ultra-processed additives with indigenous medicinal herbs and spices (such as scent leaf, turmeric, garlic, ginger, and rosemary). Our research demonstrates how natural seasonings elevate immunity and significantly lower chronic lifestyle disease risk.",
    tags: ["Cooking", "Spices", "Health"],
  },
  {
    id: "faq-8",
    question: "Where can I access recordings from ERI's seminars and symposiums?",
    category: "research",
    answer:
      "Recordings of our Health & Food Security symposiums, webinars, and public lectures are accessible through the Updates section of our website, as well as on our official YouTube channel. You can stream our latest sessions on-demand for educational or institutional use.",
    tags: ["Webinars", "Symposiums", "Media"],
  },
  {
    id: "faq-9",
    question: "Does ERI offer dietary consultations for schools and institutions?",
    category: "advocacy",
    answer:
      "Yes. We conduct bespoke nutritional audits and meal-planning consultations for nursery, primary, and secondary schools, as well as corporate cafeterias. Our goal is to ensure institutional catering menus meet optimal childhood developmental needs and foster long-term cognitive stamina.",
    tags: ["Schools", "Consultation", "Institutional"],
  },
  {
    id: "faq-10",
    question: "How can I submit a question or topic not covered here?",
    category: "general",
    answer:
      "We warmly encourage inquiries, feedback, and discussion. You can submit questions directly via our Contact Us form, email us at eleosresearchinn@gmail.com, or speak with our research desk at (+234) 8122765292.",
    tags: ["Inquiries", "Help Desk", "Support"],
  },
];
