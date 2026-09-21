import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Fraunces, Work_Sans } from "next/font/google";
import Loader from "@/components/Loader";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eleos Research Innovations - Food Security, Nutrition Security and Human Security",
  description: "We advocate for human security with primary focus on food and nutrition security.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="bg-cream-100 text-ink-900 font-sans">
        <Suspense fallback={null}>
          <Loader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
