import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/app/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jeca-prephub.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JECA PrepHub | WBJEE JECA 2026 Preparation & CBT Mock Tests",
    template: "%s | JECA PrepHub",
  },
  description:
    "Comprehensive WBJEE JECA 2026 preparation platform. Free Computer-Based Test (CBT) mock tests with official Cat-I & Cat-II negative marking, complete syllabus breakdown, PYQs, and study resources.",
  applicationName: "JECA PrepHub",
  keywords: [
    "WBJEE JECA",
    "WBJEE JECA 2026",
    "JECA CBT Mock Test",
    "JECA Exam Preparation",
    "West Bengal MCA Entrance",
    "JECA Syllabus 2026",
    "JECA Previous Year Questions",
    "JECA PYQ",
    "JECA Mock Test Free",
    "Category 1 Category 2 Marking JECA",
    "JECA PrepHub",
  ],
  authors: [{ name: "Somnath Gorai" }],
  creator: "Somnath Gorai",
  publisher: "JECA PrepHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JECA PrepHub | WBJEE JECA 2026 Preparation & CBT Mock Tests",
    description:
      "Prepare for WBJEE JECA 2026 with realistic Computer Based Tests, complete syllabus breakdown, and topic-wise practice questions.",
    url: siteUrl,
    siteName: "JECA PrepHub",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JECA PrepHub | WBJEE JECA 2026 Preparation & CBT Mock Tests",
    description:
      "Prepare for WBJEE JECA 2026 with realistic Computer Based Tests, complete syllabus breakdown, and topic-wise practice questions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "JECA PrepHub",
        description: "WBJEE JECA 2026 exam preparation and CBT mock test platform",
        inLanguage: "en-IN",
      },
      {
        "@type": "EducationalApplication",
        name: "JECA PrepHub",
        applicationCategory: "EducationalApplication",
        operatingSystem: "All",
        url: siteUrl,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        educationalUse: "Exam Preparation",
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}