"use client";

import WhatWeDoHero from "@/components/what-we-do/WhatWeDoHero";
import OfficeWhyChooseUs from "@/components/what-we-do/OfficeWhyChooseUs";
import WhatWeDoServices from "@/components/what-we-do/WhatWeDoServices";
import NutritionCta from "@/components/what-we-do/NutritionCta";

export default function MainWhatWeDo() {
  return (
    <div className="bg-cream-100 min-h-screen">
      {/* 1. Hero */}
      <WhatWeDoHero />

      {/* 2. Office Address & Why Choose Us */}
      <OfficeWhyChooseUs />

      {/* 3. Our Services — the five dropdown destinations */}
      <WhatWeDoServices />

      {/* 4. Nutrition call-to-action */}
      <NutritionCta />
    </div>
  );
}
