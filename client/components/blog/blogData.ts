// components/blog/blogData.ts — the blog's content, migrated from the
// previous WordPress site (eleosrein.com). Structured as typed editorial
// blocks so the article pages can art-direct each beat (prose, pull
// quotes, data moments). Swap for API-fetched data when the CMS lands.

import type { BlogPost } from "@/types/blog";

export const blogPosts: BlogPost[] = [
  {
    slug: "my-help-lyrics",
    title: "My Help Lyrics — Written by Precious Gabriel & Bukunmi Adaramola",
    excerpt:
      "An original song from His Story Tellers Media — a journey from searching to assurance, and the declaration that help has come from the Lord.",
    author: "admin",
    publishedAt: "2026-01-01",
    categories: ["His Story Tellers Media", "My Help Lyrics"],
    tags: ["my help", "song lyrics"],
    image: "https://eleosrein.com/wp-content/uploads/2026/01/My-Help.jpg",
    imageAlt: "My Help — featured artwork",
    content: [
      {
        type: "p",
        text:
          "From His Story Tellers Media, an original song written by Precious Gabriel & Bukunmi Adaramola.",
      },
      { type: "p", text: "Going from post to post.\nSearching for way to go.\nLooking around, coasting along" },
      { type: "p", text: "Heading from north to south.\nNeeding a hand to hold.\nTrying to stand, fighting to run." },
      { type: "p", text: "But as for me\nMy help has come from the Lord\nMy help has come from the Lord\nMy help has come from the Lord" },
      { type: "p", text: "Though the battle may be tough\nAnd the way may be rough\nI will set my eyes on him\nWho’s always by my side" },
      { type: "p", text: "Though the road may be long\nAnd the wind may blow strong\nI will set my eyes on him\nWho’s always been my help" },
      {
        type: "p",
        text:
          "My help comes from the Lord\nMy help comes from the Lord\nI will lift my eyes to the Hills\nFrom whence cometh my help\nMy Help comes from the Lord",
      },
      {
        type: "p",
        text: "More content on: youtube.com/@YouandIinLifeChannel",
      },
    ],
    archivedComments: [],
  },
  {
    slug: "scent-leaf-a-natural-supplement-for-a-faster-metabolism",
    title: "Scent Leaf: A Natural Supplement for a Faster Metabolism",
    excerpt:
      "Ocimum gratissimum — the aromatic herb at the heart of many Nigerian kitchens — packs a surprising nutritional punch and may be a natural ally for a faster metabolism.",
    author: "admin",
    publishedAt: "2024-09-24",
    categories: ["Diet", "Lifestyle"],
    tags: [],
    image: "https://eleosrein.com/wp-content/uploads/2024/09/scent-leaf-image-1200x800.jpg",
    imageAlt: "Fresh scent leaves (Ocimum gratissimum)",
    content: [
      {
        type: "p",
        text:
          "The aromatic plant known as scent leaf, or Ocimum gratissimum, grows in the heart of many African kitchens, especially in Nigeria. It has magical culinary and therapeutic properties. This humble herb, with its distinct flavor and scent, has long been prized for its remarkable health advantages as well as its capacity to give food depth. Among its most notable effects is its potential to accelerate metabolism, making it a natural ally in the quest for better health and vitality.",
      },
      {
        type: "p",
        text:
          "At just 100 grams, scent leaf packs a surprisingly powerful nutritional punch. With an energy content of 221 kcal, it’s rich in carbohydrates, providing 44.6 grams, along with 3.4 grams of protein and a modest 1.3 grams of fat. This balance of macronutrients makes it an excellent dietary addition, particularly for those looking to maintain energy levels without overwhelming their bodies with fat.",
      },
      {
        type: "data",
        title: "Scent leaf, per 100 g",
        intro: "A closer read of the numbers behind the herb.",
        rows: [
          { label: "Energy", value: "221 kcal" },
          { label: "Carbohydrates", value: "44.6 g" },
          { label: "Protein", value: "3.4 g" },
          { label: "Fat", value: "1.3 g" },
          { label: "Vitamin K", value: "102% of daily value" },
          { label: "Calcium", value: "209 mg" },
          { label: "Potassium", value: "598 mg" },
          { label: "Iron", value: "23.3% of recommended intake" },
        ],
      },
      {
        type: "p",
        text:
          "The leaf is also teeming with essential vitamins and minerals. For instance, it offers a substantial boost of Vitamin K, providing 102% of the daily recommended value. Vitamin K plays a crucial role in blood clotting and bone health, making this herb particularly beneficial for overall well-being. The herb’s Vitamin C content may seem modest at 4.6 mg, but when combined with its high antioxidant levels, it becomes an effective immune booster. Vitamin E and folate round out its vitamin profile, contributing to skin health and cellular regeneration.",
      },
      {
        type: "p",
        text:
          "Scent leaf doesn’t stop there; its mineral content is equally noteworthy. With 209 mg of calcium and 598 mg of potassium, this herb supports strong bones, muscle function, and cardiovascular health. It’s a rich source of iron too, offering 23.3% of the daily recommended intake, which is crucial for boosting oxygen flow in the blood and fighting off fatigue. Magnesium, phosphorus, and zinc further add to the herb’s ability to support metabolic processes and improve energy production.",
      },
      {
        type: "quote",
        text:
          "Ocimene, thymol, and eugenol not only give scent leaf its characteristic fragrance — they fight inflammation, reduce stress on cells, and promote a healthier, faster metabolism.",
      },
      {
        type: "p",
        text:
          "But perhaps one of the most exciting aspects of scent leaf lies in its other compounds—antioxidants and essential oils. These compounds, particularly ocimene, thymol, and eugenol, not only give scent leaf its characteristic fragrance but also serve to fight inflammation, reduce stress on cells, and promote a healthier, faster metabolism. These essential oils have been traditionally used for their antimicrobial properties, making scent leaf not just a culinary delight but also a natural remedy for infections and digestive issues.",
      },
      {
        type: "p",
        text:
          "Ultimately, while the nutritional values of scent leaf may vary depending on the plant’s growing conditions and preparation, its role as a metabolism booster and a powerhouse of nutrients remains uncontested. Adding it to your diet might be the simple, natural way to improve your overall metabolic function and health.",
      },
    ],
    archivedComments: [
      {
        authorName: "H-SETS",
        body: "Thanks for this post, it’s really enlightening.",
        postedAt: "2024-09-24T13:04:00Z",
      },
      {
        authorName: "Blessing",
        body: "Very insightful!\n\nThank you so much for sharing.",
        postedAt: "2024-09-25T16:46:00Z",
      },
      {
        authorName: "Abdulrasheed Mobolaji Idowu Oyeleke",
        body: "Thank you for these info 😇🙏🤍",
        postedAt: "2024-10-06T03:28:00Z",
      },
    ],
  },
  {
    slug: "the-first-time-i-saw-a-dry-leaf-grow",
    title: "The First Time I Saw a Dry Leaf Grow (The Life Plant – Bryophyllum Pinnatum)",
    excerpt:
      "A vacation ritual became a small miracle: dried leaves meant for smoothie powder sprouting tiny green leaves and white roots — the resurrection leaf, up close.",
    author: "admin",
    publishedAt: "2024-09-24",
    updatedAt: "2024-09-25",
    categories: ["Diet", "Lifestyle"],
    tags: [],
    image:
      "https://eleosrein.com/wp-content/uploads/2024/09/Life-plant-image-dry-leafgrowing-1200x800.jpg",
    imageAlt: "A dried life plant leaf sprouting tiny green leaves and white roots",
    content: [
      {
        type: "p",
        text:
          "It was close to my vacation time when I realized the importance of taking along my favorite leaf which is a regular feature in my smoothies. I decided to gather a large amount to dry and blend to powder for future trips. To retain its nutritional value, I dried my leaves away from intense sunlight but in a well-ventilated area to allow nature work its magic.",
      },
      {
        type: "p",
        text:
          "To my amazement, after several weeks, the leaves had dried but I noticed something strange that pulled me to observe the leaves more closely, guess what I saw? Tiny green leaves and white roots growing on each of the dry leaves. I cried in amazement, and asked, how could a dry leaf sprout again? I then began to figure out why they called Bryophyllum pinnatum, a resurrection leaf.",
      },
      {
        type: "quote",
        text:
          "The dry leaves, which I had thought were done for, were now bursting with life. Each little sprout was a testament to resilience and renewal.",
      },
      {
        type: "p",
        text:
          "I marveled at this transformation. It was the first time I had witnessed such a phenomenon, and it filled me with awe and wonder at God’s amazing works in nature.",
      },
      {
        type: "list",
        title: "Reproductive health support",
        items: [
          "Fertility support",
          "Pregnancy support",
          "Postpartum care",
          "Reproductive infections",
          "Hormonal balance",
          "Uterine health",
          "Ovulation support",
          "Reproductive tract health",
          "Menstrual irregularities regulation",
          "Menstrual pain relief",
        ],
      },
      {
        type: "list",
        title: "General health benefits",
        items: [
          "Wound healing",
          "Anti-inflammatory",
          "Antioxidant",
          "Antimicrobial",
          "Digestive health",
          "Immune system support",
          "Skin and hair care",
          "Anti-anxiety and anti-stress",
          "Cardiovascular health",
        ],
      },
      {
        type: "data",
        title: "Mineral content — per 200 g pack",
        rows: [
          { label: "Calcium", value: "170 mg" },
          { label: "Phosphorus", value: "84.8 mg" },
          { label: "Potassium", value: "450 mg" },
          { label: "Sodium", value: "10 mg" },
          { label: "Iron", value: "4.8 mg" },
          { label: "Zinc", value: "2 mg" },
          { label: "Magnesium", value: "40.8 mg" },
          { label: "Copper", value: "0.8 mg" },
          { label: "Manganese", value: "2 mg" },
        ],
      },
      {
        type: "data",
        title: "Vitamin content — per 200 g pack",
        rows: [
          { label: "Vitamin A", value: "0.8 mg" },
          { label: "Vitamin C", value: "10 mg" },
          { label: "Vitamin E", value: "2 mg" },
          { label: "Vitamin K", value: "4.8 mg" },
          { label: "Thiamin (B1)", value: "0.08 mg" },
          { label: "Riboflavin (B2)", value: "0.2 mg" },
          { label: "Niacin (B3)", value: "2 mg" },
          { label: "Pyridoxine (B6)", value: "0.4 mg" },
          { label: "Folate", value: "0.8 mg" },
        ],
      },
      {
        type: "p",
        text:
          "Its proximate composition includes – moisture: 184 g; ash: 6.8 g; crude protein: 4.2 g; crude fiber: 2.4 g; crude fat: 1.2 g; and carbohydrates: 8.6 g. It contains amazing phytochemicals, such as alkaloids, flavonoids, phenolic acids, saponins, tannins, anthocyanins and glycosides, considered to be present. Other compounds include fiber (8 g), water (92%) and antioxidants (flavonoids, phenolic acids, and ascorbic acid).",
      },
      {
        type: "p",
        text:
          "Incorporating Bryophyllum Pinnatum in your regular diets may improve your health in tremendous ways.",
      },
    ],
    archivedComments: [
      {
        authorName: "Abdulrasheed Mobolaji Idowu Oyeleke",
        body: "Keep doing well, Ma’am 👍🙏🙇‍♂️🧡",
        postedAt: "2024-10-06T03:21:00Z",
      },
    ],
  },
];

/** Chronologically newest first. */
export const sortedBlogPosts: BlogPost[] = [...blogPosts].sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Unique category list with counts, like the previous site's sidebar widget. */
export function getCategories(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of blogPosts) {
    for (const category of post.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

/** Unique tag list, like the previous site's sidebar widget. */
export function getAllTags(): string[] {
  return [...new Set(blogPosts.flatMap((post) => post.tags))];
}
