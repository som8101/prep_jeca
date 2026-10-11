import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JECA CBT Mock Test Engine (Cat-I & Cat-II)",
  description:
    "Official WBJEE JECA 2026 computer based mock test simulator. Features 100 questions, 120 minutes, Category-I (+1/-0.25) & Category-II (+2/partial marks) scoring, and in-depth performance analytics.",
  alternates: {
    canonical: "/mock",
  },
  openGraph: {
    title: "JECA CBT Mock Test Engine | Official Format 2026",
    description:
      "Practice full-length WBJEE JECA Computer Based Tests with authentic timers, question palettes, Category-I & II scoring, and review analytics.",
    url: "/mock",
  },
  twitter: {
    card: "summary_large_image",
    title: "JECA CBT Mock Test Engine | Official Format 2026",
    description:
      "Practice full-length WBJEE JECA Computer Based Tests with authentic timers, question palettes, Category-I & II scoring, and review analytics.",
  },
};

export default function MockLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {children}
    </div>
  );
}
