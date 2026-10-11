import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JECA PrepHub - WBJEE JECA 2026 Preparation",
    short_name: "JECA PrepHub",
    description: "Master WBJEE JECA with authentic CBT mock tests, full syllabus breakdown, and previous year questions.",
    start_url: "/",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
