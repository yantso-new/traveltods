import type { Metadata } from "next";
import {
  breadcrumbJsonLd,
  countryPath,
  destinationPath,
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
  const destinations = getCountryDestinations(slug);
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
      <section className="bg-background-light px-4 py-10 md:px-20">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[var(--border)] bg-surface-light p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Country family travel hub</p>
          <h1 className="mt-3 text-3xl font-black text-text-main-light md:text-5xl">
            Best family-friendly destinations in {country}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-sub-light md:text-lg">
            Compare {country} destinations for toddler-friendly days, stroller access, playgrounds, safety, weather comfort, and kid activities before you choose a family base.
          </p>
          {destinations.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {destinations.map((destination) => (
                <a key={destination.id} href={destinationPath(destination)} className="rounded-full bg-muted px-4 py-2 text-sm font-bold text-primary hover:underline">
                  {destination.name} with kids
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      <CountryPageClient />
    </>
  );
}
