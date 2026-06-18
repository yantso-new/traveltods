import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";
import { breadcrumbJsonLd, jsonLd } from "@/seo";

export const metadata: Metadata = {
  title: "Family Travel Tips and Destination Guides",
  description: "Source-backed destination guides and practical travel tips for parents traveling with toddlers and kids under 10.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Family Travel Tips and Destination Guides",
    description: "Practical family travel guides for destinations, flights, hotels, food safety, packing, and beach days with young kids.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Travel Tips and Destination Guides",
    description: "Practical travel advice for parents traveling with kids under 10.",
  },
};

export default function BlogPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />
      <BlogPageClient />
    </>
  );
}
