import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/blogData";
import { MOCK_DESTINATIONS } from "@/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://traveltods.com";

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const countries = Array.from(
    new Set(MOCK_DESTINATIONS.map((destination) => destination.country))
  );

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.lastUpdated),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.6,
    })),
    ...MOCK_DESTINATIONS.map((destination) => ({
      url: absoluteUrl(
        `/destination/${encodeURIComponent(`${destination.name}, ${destination.country}`)}`
      ),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...countries.map((country) => ({
      url: absoluteUrl(`/country/${encodeURIComponent(country)}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
