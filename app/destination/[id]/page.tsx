import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  breadcrumbJsonLd,
  getStaticDestination,
  jsonLd,
  relatedBlogPostsForDestination,
  truncateDescription,
} from "@/seo";
import { SHOW_SCORES } from "@/config";
import { absoluteUrl } from "@/site";
import { getDestinationRecord, isPublishedDestination } from "@/lib/published-destinations";
import { Navbar } from "@/components/Navbar";
import { DestinationHero } from "@/components/DestinationHero";
import DestinationDetailsClient from "./DestinationDetailsClient";

// Convex reads happen per request. A statically generated route would fail
// with "Page changed from static to dynamic" on the first database-backed id.
export const dynamic = "force-dynamic";

interface DestinationRouteProps {
  params: Promise<{ id: string }>;
}

interface DestinationSeoData {
  name: string;
  city: string;
  country: string;
  description: string;
  shortDescription: string;
  image?: string;
  lastUpdated?: number;
  scores: {
    safety: number;
    strollerFriendly: number;
    sidewalks: number;
    playgrounds: number;
    kidActivities: number;
  };
  relatedPosts: ReturnType<typeof relatedBlogPostsForDestination>;
}

function scoreOutOfTen(value?: number) {
  return Math.max(0, Math.min(10, Math.round((value ?? 0) / 10)));
}

interface ResolvedDestination {
  destination: DestinationSeoData;
  // Unpublished database rows are still reachable by URL, but never indexed.
  indexable: boolean;
}

// Returns null only when no record exists. Lookup failures throw, so an outage
// is a 500 rather than a false 404.
const resolveDestination = cache(async (id: string): Promise<ResolvedDestination | null> => {
  const decodedId = decodeURIComponent(id);
  const staticDestination = getStaticDestination(decodedId);

  if (staticDestination) {
    return {
      indexable: true,
      destination: {
        name: `${staticDestination.name}, ${staticDestination.country}`,
        city: staticDestination.name,
        country: staticDestination.country,
        description: staticDestination.description,
        shortDescription: staticDestination.shortDescription,
        image: staticDestination.image,
        scores: {
          safety: staticDestination.metrics.safety,
          strollerFriendly: staticDestination.metrics.strollerFriendly,
          sidewalks: staticDestination.metrics.sidewalks,
          playgrounds: staticDestination.metrics.playgrounds,
          kidActivities: staticDestination.metrics.kidActivities,
        },
        relatedPosts: relatedBlogPostsForDestination(staticDestination),
      },
    };
  }

  const record = await getDestinationRecord(decodedId);
  if (!record) return null;

  return {
    indexable: isPublishedDestination(record),
    destination: {
      name: record.name,
      city: record.name.split(",")[0]?.trim() || record.name,
      country: record.country,
      description: record.description || "",
      shortDescription: record.shortDescription || "",
      image: record.image,
      lastUpdated: record.lastUpdated,
      scores: {
        safety: scoreOutOfTen(record.allScores.safety),
        strollerFriendly: scoreOutOfTen(record.allScores.strollerFriendly),
        sidewalks: scoreOutOfTen(record.allScores.sidewalks),
        playgrounds: scoreOutOfTen(record.allScores.playgrounds),
        kidActivities: scoreOutOfTen(record.allScores.kidActivities),
      },
      relatedPosts: [],
    },
  };
});

export async function generateMetadata({ params }: DestinationRouteProps): Promise<Metadata> {
  const { id } = await params;
  const resolved = await resolveDestination(id);
  const decodedId = decodeURIComponent(id);

  if (!resolved || !resolved.indexable) {
    return {
      title: `${decodedId} Family Travel Guide`,
      description: `TravelTods is still verifying family travel information for ${decodedId}.`,
      alternates: {
        canonical: `/destination/${encodeURIComponent(decodedId)}`,
      },
      robots: {
        index: false,
        follow: false,
        noarchive: true,
      },
    };
  }

  const { destination } = resolved;

  const title = `${destination.city} with Kids: Family Travel Guide`;
  const description = truncateDescription(
    `${destination.shortDescription} See safety, stroller access, playground, and kid activity notes for ${destination.city}, ${destination.country}.`
  );
  const path = `/destination/${encodeURIComponent(destination.name)}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: destination.image
        ? [{ url: destination.image, width: 1200, height: 630, alt: destination.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: destination.image ? [destination.image] : undefined,
    },
  };
}

export default async function DestinationPage({ params }: DestinationRouteProps) {
  const { id } = await params;
  const resolved = await resolveDestination(id);

  if (!resolved) notFound();

  // Unpublished rows get the client view only: no SEO summary and no structured data.
  if (!resolved.indexable) return <DestinationDetailsClient />;

  const { destination } = resolved;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: destination.name,
      description: destination.description,
      image: destination.image,
      url: absoluteUrl(`/destination/${encodeURIComponent(destination.name)}`),
      address: {
        "@type": "PostalAddress",
        addressCountry: destination.country,
      },
      touristType: ["Families", "Parents traveling with kids", "Toddlers"],
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: destination.country, path: `/country/${encodeURIComponent(destination.country)}` },
      { name: destination.city, path: `/destination/${encodeURIComponent(destination.name)}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <Navbar />
      <DestinationHero
        name={destination.name}
        country={destination.country}
        image={destination.image}
        shortDescription={destination.shortDescription}
      />
      <DestinationSeoSummary destination={destination} />
      <DestinationDetailsClient hideChrome />
    </>
  );
}

function DestinationSeoSummary({ destination }: { destination: DestinationSeoData }) {
  return (
    <section className="bg-background-light px-4 pt-10 pb-0 md:px-20">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[var(--border)] bg-surface-light p-6 md:p-8">
        <p className="max-w-3xl text-base leading-relaxed text-text-sub-light md:text-lg">
          {destination.description}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SeoFact title="Best age fit" value="Toddlers and kids under 10" />
          {SHOW_SCORES && <SeoFact title="Stroller notes" value={`Stroller score ${destination.scores.strollerFriendly}/10 with sidewalks ${destination.scores.sidewalks}/10.`} />}
          {SHOW_SCORES && <SeoFact title="Safety notes" value={`Safety score ${destination.scores.safety}/10 for parent planning.`} />}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SHOW_SCORES && <SeoFact title="Outdoor ease" value={`Playground score ${destination.scores.playgrounds}/10 with sidewalks ${destination.scores.sidewalks}/10.`} />}
          {SHOW_SCORES && <SeoFact title="Rainy-day options" value={`Kid activity score ${destination.scores.kidActivities}/10 for museums, attractions, and indoor stops.`} />}
          <SeoFact title="Planning approach" value="Plan one anchor activity per half day, then keep meals, playgrounds, and rest stops close together." />
        </div>
        {destination.relatedPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-black text-text-main-light">Related family travel articles</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {destination.relatedPosts.map((post) => (
                <a key={post.slug} href={`/blog/${post.slug}`} className="rounded-full bg-muted px-4 py-2 text-sm font-bold text-primary hover:underline">
                  {post.title}
                </a>
              ))}
            </div>
          </div>
        )}
        <p className="mt-6 text-xs font-medium text-text-sub-light">
          {SHOW_SCORES && "Scores combine public destination data and family-planning signals. "}<a href="/methodology" className="font-bold text-primary hover:underline">Review the methodology</a> and verify time-sensitive details before booking.
          {destination.lastUpdated ? ` Data updated ${new Date(destination.lastUpdated).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}.` : ""}
        </p>
      </div>
    </section>
  );
}

function SeoFact({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-muted/35 p-4">
      <h2 className="text-sm font-black uppercase tracking-wider text-text-main-light">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-sub-light">{value}</p>
    </div>
  );
}
