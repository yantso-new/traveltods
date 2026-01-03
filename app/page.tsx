"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import { Destination, DestinationMetrics } from '@/types';
import { MOCK_DESTINATIONS } from '@/constants';
import { DestinationCard } from '@/components/DestinationCard';
import { Badge, Button } from '@/components/ui';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const INITIAL_DISPLAY_COUNT = 20;

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  // Fetch all destinations from Convex
  const convexDestinations = useQuery(api.destinations.getAllDestinations);

  // Transform Convex data to UI format
  const dbDestinations: Destination[] = (convexDestinations || []).map(d => ({
    id: d.name, // Use name as ID for routing to match gather logic
    name: d.name,
    country: d.country,
    shortDescription: d.shortDescription || d.description?.slice(0, 100) + "..." || "",
    description: d.description || "",
    image: d.image || "/placeholder.jpg",
    tags: d.tags || [],
    metrics: {
      accessibility: (d.allScores?.accessibility ?? 50) / 10,
      nature: (d.allScores?.playgrounds ?? 50) / 10, // Proxy
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

  // Only use dbDestinations (already filtered by rating >= 8 from Convex)
  // Fall back to mock data only if no convex data available
  const allDestinations = dbDestinations.length > 0
    ? dbDestinations
    : formattedMocks.filter(m => (m.familyScore ?? 0) >= 80);

  const filteredDestinations = allDestinations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Destinations to display (limited by displayCount)
  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = filteredDestinations.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-rose-50 via-sky-50 to-stone-50 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="bg-white/60 text-rose-500 border-rose-100 text-sm px-4 py-1.5 mb-6 shadow-sm backdrop-blur-sm">
            Top Rated for Families
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-stone-800 tracking-tight leading-tight">
            Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">family adventure</span>.
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
            Discover destinations rated by kid-compatibility. From stroller accessibility to playground density, we've got the metrics that matter to parents.
          </p>

          <DestinationAutocomplete
            className="max-w-xl mx-auto mt-10"
            onSelect={(dest) => {
              const destinationName = `${dest.name}, ${dest.country}`;
              setSearchTerm(destinationName);
              router.push(`/destination/${encodeURIComponent(destinationName)}`);
            }}
            onSearch={(query) => {
              setSearchTerm(query);
              router.push(`/destination/${encodeURIComponent(query)}`);
            }}
          />
        </div>
      </div>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-stone-800">Popular Destinations</h2>
          <div className="hidden md:flex gap-2">
            <Badge className="cursor-pointer hover:bg-emerald-100 bg-emerald-50 text-emerald-700 border-emerald-100">Nature</Badge>
            <Badge className="cursor-pointer hover:bg-sky-100 bg-sky-50 text-sky-700 border-sky-100">City</Badge>
            <Badge className="cursor-pointer hover:bg-amber-100 bg-amber-50 text-amber-700 border-amber-100">Beach</Badge>
          </div>
        </div>

        {displayedDestinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  onClick={handleShowMore}
                  className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-8 py-3 rounded-full shadow-sm flex items-center gap-2"
                >
                  Show More
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-stone-300">
            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700">No destinations found</h3>
            <p className="text-stone-400 mt-2">
              Try searching specifically for a city to generate a custom guide for "{searchTerm}".
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
