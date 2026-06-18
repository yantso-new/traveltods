import type { Metadata } from "next";
import {
  breadcrumbJsonLd,
  destinationPath,
  getStaticDestination,
  jsonLd,
  relatedBlogPostsForDestination,
  touristDestinationJsonLd,
  truncateDescription,
} from "@/seo";
import DestinationDetailsClient from "./DestinationDetailsClient";

interface DestinationRouteProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: DestinationRouteProps): Promise<Metadata> {
  const { id } = await params;
  const destination = getStaticDestination(id);
  const decodedId = decodeURIComponent(id);

  if (!destination) {
    return {
      title: `${decodedId} Family Travel Guide`,
      description: `Explore family-friendly travel information for ${decodedId}, including safety, stroller access, kid activities, and practical parent tips.`,
      alternates: {
        canonical: `/destination/${encodeURIComponent(decodedId)}`,
      },
    };
  }

  const title = `${destination.name} with Kids: Family Travel Guide`;
  const description = truncateDescription(
    `${destination.shortDescription} See toddler-friendly scores, safety notes, stroller access, playgrounds, and family activity ideas for ${destination.name}, ${destination.country}.`
  );

  return {
    title,
    description,
    alternates: {
      canonical: destinationPath(destination),
    },
    openGraph: {
      title,
      description,
      url: destinationPath(destination),
      type: "website",
      images: [
        {
          url: destination.image,
          width: 1200,
          height: 630,
          alt: `${destination.name}, ${destination.country}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [destination.image],
    },
  };
}

export default async function DestinationPage({ params }: DestinationRouteProps) {
  const { id } = await params;
  const destination = getStaticDestination(id);

  const structuredData = destination
    ? [
        touristDestinationJsonLd(destination),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: destination.country, path: `/country/${encodeURIComponent(destination.country)}` },
          { name: destination.name, path: destinationPath(destination) },
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

function DestinationSeoSummary({
  destination,
}: {
  destination: NonNullable<ReturnType<typeof getStaticDestination>>;
}) {
  const relatedPosts = relatedBlogPostsForDestination(destination);

  return (
    <section className="bg-background-light px-4 py-10 md:px-20">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[var(--border)] bg-surface-light p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Family destination guide</p>
        <h1 className="mt-3 text-3xl font-black text-text-main-light md:text-5xl">
          {destination.name} with kids
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-sub-light md:text-lg">
          {destination.description}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SeoFact title="Best age fit" value="Toddlers and kids under 10" />
          <SeoFact title="Stroller notes" value={`Stroller score ${destination.metrics.strollerFriendly}/10 with sidewalks ${destination.metrics.sidewalks}/10.`} />
          <SeoFact title="Safety notes" value={`Safety score ${destination.metrics.safety}/10 for parent planning.`} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SeoFact title="Free activities" value={`Playground score ${destination.metrics.playgrounds}/10 and nature score ${destination.metrics.nature}/10.`} />
          <SeoFact title="Rainy-day options" value={`Kid activity score ${destination.metrics.kidActivities}/10 for museums, attractions, and indoor stops.`} />
          <SeoFact title="1-day itinerary" value="Start with a high-energy kid activity, schedule a quiet lunch break, then keep the afternoon flexible near parks or transit." />
        </div>
        {relatedPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-black text-text-main-light">Related family travel articles</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {relatedPosts.map((post) => (
                <a key={post.slug} href={`/blog/${post.slug}`} className="rounded-full bg-muted px-4 py-2 text-sm font-bold text-primary hover:underline">
                  {post.title}
                </a>
              ))}
            </div>
          </div>
        )}
        <p className="mt-6 text-xs font-medium text-text-sub-light">
          TravelTods scores combine family safety, playgrounds, sidewalks, stroller access, weather comfort, kid activities, and cost signals. Last reviewed for static guide pages in 2026.
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
