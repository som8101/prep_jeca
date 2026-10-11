import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jeca-prephub.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/mock", "/mock/practice"],
        disallow: ["/api/", "/mock/exam/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
