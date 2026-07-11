import type { Metadata } from "next";
import { cache } from "react";
import {
  breadcrumbJsonLd,
  getStaticDestination,
  jsonLd,
  relatedBlogPostsForDestination,
  truncateDescription,
} from "@/seo";
import { absoluteUrl } from "@/site";
import { getPublishedDestination } from "@/lib/published-destinations";
import DestinationDetailsClient from "./DestinationDetailsClient";

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

const resolveDestination = cache(async (id: string): Promise<DestinationSeoData | null> => {
  const decodedId = decodeURIComponent(id);
  const staticDestination = getStaticDestination(decodedId);

  if (staticDestination) {
    return {
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
    };
  }

  const publishedDestination = await getPublishedDestination(decodedId);
  if (!publishedDestination) return null;

  return {
    name: publishedDestination.name,
    city: publishedDestination.name.split(",")[0]?.trim() || publishedDestination.name,
    country: publishedDestination.country,
    description: publishedDestination.description || "",
    shortDescription: publishedDestination.shortDescription || "",
    image: publishedDestination.image,
    lastUpdated: publishedDestination.lastUpdated,
    scores: {
      safety: scoreOutOfTen(publishedDestination.allScores.safety),
      strollerFriendly: scoreOutOfTen(publishedDestination.allScores.strollerFriendly),
      sidewalks: scoreOutOfTen(publishedDestination.allScores.sidewalks),
      playgrounds: scoreOutOfTen(publishedDestination.allScores.playgrounds),
      kidActivities: scoreOutOfTen(publishedDestination.allScores.kidActivities),
    },
    relatedPosts: [],
  };
});

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: DestinationRouteProps): Promise<Metadata> {
  const { id } = await params;
  const destination = await resolveDestination(id);
  const decodedId = decodeURIComponent(id);

  if (!destination) {
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
  const destination = await resolveDestination(id);

  const structuredData = destination
    ? [
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
      ]
    : breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: decodeURIComponent(id), path: `/destination/${id}` },
      ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      {destination && <DestinationSeoSummary destination={destination} />}
      <DestinationDetailsClient />
    </>
  );
}

function DestinationSeoSummary({ destination }: { destination: DestinationSeoData }) {
  return (
    <section className="bg-background-light px-4 py-10 md:px-20">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[var(--border)] bg-surface-light p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Family destination guide</p>
        <h1 className="mt-3 text-3xl font-black text-text-main-light md:text-5xl">
          {destination.city} with kids
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-sub-light md:text-lg">
          {destination.description}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SeoFact title="Best age fit" value="Toddlers and kids under 10" />
          <SeoFact title="Stroller notes" value={`Stroller score ${destination.scores.strollerFriendly}/10 with sidewalks ${destination.scores.sidewalks}/10.`} />
          <SeoFact title="Safety notes" value={`Safety score ${destination.scores.safety}/10 for parent planning.`} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SeoFact title="Outdoor ease" value={`Playground score ${destination.scores.playgrounds}/10 with sidewalks ${destination.scores.sidewalks}/10.`} />
          <SeoFact title="Rainy-day options" value={`Kid activity score ${destination.scores.kidActivities}/10 for museums, attractions, and indoor stops.`} />
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
          Scores combine public destination data and family-planning signals. <a href="/methodology" className="font-bold text-primary hover:underline">Review the methodology</a> and verify time-sensitive details before booking.
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
