"use client";

import WhoWeAreHero from "@/components/who-we-are/WhoWeAreHero";
import AboutStory from "@/components/who-we-are/AboutStory";
import MissionVision from "@/components/who-we-are/MissionVision";
import WhoWeAreTestimonials from "@/components/who-we-are/WhoWeAreTestimonials";

export default function MainWhoWeAre() {
  return (
    <div className="bg-cream-100 min-h-screen">
      {/* 1. Hero Header */}
      <WhoWeAreHero />

      {/* 2. Core Story & Impact Overview */}
      <AboutStory />

      {/* 3. Mission, Vision & Core Values */}
      <MissionVision />

      {/* 5. Community & Client Testimonials */}
      <WhoWeAreTestimonials />
    </div>
  );
}
