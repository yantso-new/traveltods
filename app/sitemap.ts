import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/blogData";
import { MOCK_DESTINATIONS } from "@/constants";
import { absoluteUrl } from "@/site";
import { countryPath, destinationPath } from "@/seo";
import { getPublishedDestinationInventory } from "@/lib/published-destinations";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedDestinations = await getPublishedDestinationInventory();
  const destinationEntries = new Map<string, MetadataRoute.Sitemap[number]>();

  MOCK_DESTINATIONS.forEach((destination) => {
    destinationEntries.set(destinationPath(destination).toLowerCase(), {
      url: absoluteUrl(destinationPath(destination)),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  publishedDestinations.forEach((destination) => {
    const path = `/destination/${encodeURIComponent(destination.name)}`;
    destinationEntries.set(path.toLowerCase(), {
      url: absoluteUrl(path),
      lastModified: new Date(destination.lastUpdated),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  const countries = Array.from(
    new Set(MOCK_DESTINATIONS.map((destination) => destination.country))
  ).sort();

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.lastUpdated),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.6,
    })),
    ...destinationEntries.values(),
    ...countries.map((country) => ({
      url: absoluteUrl(countryPath(country)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
