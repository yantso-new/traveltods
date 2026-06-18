import { BLOG_POSTS, BlogPost } from "./blogData";
import { MOCK_DESTINATIONS } from "./constants";
import { Destination } from "./types";
import { absoluteUrl } from "./site";

export const SITE_NAME = "TravelTods";
export const SITE_AUTHOR = "TravelTods Editorial Team";

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function destinationId(destination: Destination) {
  return `${destination.name}, ${destination.country}`;
}

export function destinationPath(destination: Destination) {
  return `/destination/${encodeURIComponent(destinationId(destination))}`;
}

export function countryPath(country: string) {
  return `/country/${encodeURIComponent(country)}`;
}

export function getStaticDestination(id: string) {
  const decodedId = decodeURIComponent(id);

  return MOCK_DESTINATIONS.find((destination) => {
    return destinationId(destination).toLowerCase() === decodedId.toLowerCase();
  });
}

export function getCountryDestinations(country: string) {
  const decodedCountry = decodeURIComponent(country);

  return MOCK_DESTINATIONS.filter((destination) => {
    return destination.country.toLowerCase() === decodedCountry.toLowerCase();
  });
}

export function getCountries() {
  return Array.from(new Set(MOCK_DESTINATIONS.map((destination) => destination.country))).sort();
}

export function truncateDescription(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function stripMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function blogPostUrl(post: BlogPost) {
  return absoluteUrl(`/blog/${post.slug}`);
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/destination/")}{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogPostingJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image.url,
    datePublished: post.lastUpdated,
    dateModified: post.lastUpdated,
    author: {
      "@type": "Organization",
      name: SITE_AUTHOR,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: blogPostUrl(post),
  };
}

export function touristDestinationJsonLd(destination: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destinationId(destination),
    description: destination.description,
    image: destination.image,
    url: absoluteUrl(destinationPath(destination)),
    address: {
      "@type": "PostalAddress",
      addressCountry: destination.country,
    },
    touristType: ["Families", "Parents traveling with kids", "Toddlers"],
  };
}

export function relatedBlogPostsForDestination(destination: Destination) {
  const city = destination.name.toLowerCase();
  const country = destination.country.toLowerCase();

  return BLOG_POSTS.filter((post) => {
    return (
      post.destinationName?.toLowerCase() === city ||
      post.title.toLowerCase().includes(city) ||
      post.title.toLowerCase().includes(country)
    );
  });
}
