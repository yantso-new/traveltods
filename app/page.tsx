"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Destination, DestinationMetrics } from '@/types';
import { MOCK_DESTINATIONS } from '@/constants';
import { DestinationCard } from '@/components/DestinationCard';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { Button, Badge } from '@/components/ui';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';

const INITIAL_DISPLAY_COUNT = 12;

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  // Fetch all destinations from Convex
  const convexDestinations = useQuery(api.destinations.getTopRatedDestinations, {});

  // Transform Convex data to UI format
  const dbDestinations: Destination[] = (convexDestinations || []).map((d: any) => ({
    id: d.name,
    name: d.name,
    country: d.country,
    shortDescription: d.shortDescription || d.description?.slice(0, 100) + "..." || "",
    description: d.description || "",
    image: d.image || "/placeholder.jpg",
    tags: d.tags || [],
    metrics: {
      accessibility: (d.allScores?.accessibility ?? 50) / 10,
      nature: (d.allScores?.playgrounds ?? 50) / 10,
      playgrounds: (d.allScores?.playgrounds ?? 50) / 10,
      healthyFood: (d.allScores?.healthyFood ?? 50) / 10,
      safety: (d.allScores?.safety ?? 50) / 10,
      walkability: (d.allScores?.sidewalks ?? 50) / 10,
      strollerFriendly: (d.allScores?.strollerFriendly ?? 50) / 10,
      kidActivities: (d.allScores?.kidActivities ?? 50) / 10,
      weatherComfort: (d.allScores?.weatherComfort ?? 50) / 10,
      costAffordability: (d.allScores?.costAffordability ?? 50) / 10,
    } as DestinationMetrics,
    familyScore: d.allScores?.familyScore ?? null,
    hasReliableScore: d.dataQuality?.hasReliableOverallScore ?? false,
  }));

  const formattedMocks = MOCK_DESTINATIONS.map(m => ({
    ...m,
    id: `${m.name}, ${m.country}`,
    name: `${m.name}, ${m.country}`
  }));

  const allDestinations = dbDestinations.length > 0
    ? dbDestinations
    : formattedMocks.filter(m => (m.familyScore ?? 0) >= 80);

  const filteredDestinations = allDestinations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = filteredDestinations.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is reactive already via searchTerm state, but this handles Enter key
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light text-text-main-light transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        <Hero onSearchTermChange={setSearchTerm} />

        {/* Listings Section */}
        <section className="py-16 px-4 md:px-20 flex justify-center bg-gradient-to-b from-transparent to-orange-50/50">
          <div className="w-full max-w-7xl flex flex-col gap-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="relative">
                <div className="absolute -top-6 -left-6 size-16 bg-accent/30 rounded-full blur-xl animate-pulse"></div>
                <h2 className="relative text-text-main-light text-3xl md:text-5xl font-black leading-tight tracking-tight">Top Picks for Families</h2>
                <p className="relative text-lg text-text-sub-light mt-3 font-medium">
                  Curated destinations with the highest <span className="text-primary font-bold">toddler happiness</span> ratings.
                </p>
              </div>
              {/* Pagination / Show More is handled at bottom, but maybe a view all link here? */}
            </div>

            {displayedDestinations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {displayedDestinations.map(dest => (
                    <DestinationCard
                      key={dest.id}
                      destination={dest}
                      onClick={() => router.push(`/destination/${encodeURIComponent(dest.id)}`)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="outline"
                      onClick={handleShowMore}
                      className="px-8 py-4 h-auto text-base border-2"
                    >
                      Show More Destinations
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-stone-300">
                <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-stone-300">search_off</span>
                </div>
                <h3 className="text-xl font-semibold text-stone-700">No destinations found</h3>
                <p className="text-stone-400 mt-2">
                  Try adjusting your search for "{searchTerm}".
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
