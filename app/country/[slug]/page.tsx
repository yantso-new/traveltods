import type { Metadata } from "next";
import {
  breadcrumbJsonLd,
  countryPath,
  getCountryDestinations,
  jsonLd,
  truncateDescription,
} from "@/seo";
import CountryPageClient from "./CountryPageClient";

interface CountryRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CountryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const country = decodeURIComponent(slug);
  const destinations = getCountryDestinations(slug);
  const title = `${country} Family Travel Destinations`;
  const destinationNames = destinations.map((destination) => destination.name).join(", ");

  return {
    title,
    description: truncateDescription(
      destinations.length
        ? `Explore family-friendly destinations in ${country}, including ${destinationNames}, with safety, stroller access, playground, and kid activity signals.`
        : `Explore family-friendly destinations in ${country}, with parent-focused safety, stroller access, playground, and kid activity signals.`
    ),
    alternates: {
      canonical: countryPath(country),
    },
    robots: destinations.length
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    openGraph: {
      title,
      description: `Family-friendly destination ideas and parent planning notes for ${country}.`,
      url: countryPath(country),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Family-friendly destination ideas for ${country}.`,
    },
  };
}

export default async function CountryPage({ params }: CountryRouteProps) {
  const { slug } = await params;
  const country = decodeURIComponent(slug);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: country, path: countryPath(country) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />
      <CountryPageClient />
    </>
  );
}
