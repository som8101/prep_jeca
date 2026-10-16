import React from "react";

export const metadata = {
  title: "JECA Mock Test Engine | Computer Based Test (CBT)",
  description:
    "Official format JECA 2026 computer based mock tests with Category-I & II scoring, authentic countdown timer, and detailed analytics.",
};

export default function MockLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {children}
    </div>
  );
}
