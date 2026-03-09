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
import { BlogSection } from '@/components/BlogSection';

const INITIAL_DISPLAY_COUNT = 12;

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filters = [
    { name: 'All', icon: 'explore' },
    { name: 'Safe', icon: 'health_and_safety' },
    { name: 'Outdoors', icon: 'landscape' },
    { name: 'Culture', icon: 'museum' },
    { name: 'Budget', icon: 'savings' },
  ];

  const handleFilterChange = (name: string) => {
    setActiveFilter(name);
    setIsFilterOpen(false);
  };

  const selectedFilter = filters.find(f => f.name === activeFilter) || filters[0];

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

  const filteredDestinations = allDestinations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Safe') return d.metrics.safety >= 8;
    if (activeFilter === 'Outdoors') return d.tags.some(t => ['Nature', 'Parks', 'Islands', 'Coastal'].includes(t));
    if (activeFilter === 'Culture') return d.tags.some(t => ['Culture', 'Museums', 'History', 'Historic', 'Art'].includes(t));
    if (activeFilter === 'Budget') return d.metrics.costAffordability >= 7;

    return true;
  });

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = filteredDestinations.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light text-text-main-light transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        <Hero onSearchTermChange={setSearchTerm} />

        {/* Listings Section */}
        <section className="py-16 px-4 md:px-20 flex justify-center bg-gradient-to-b from-transparent to-orange-50/50">
          <div className="w-full max-w-7xl flex flex-col gap-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="relative">
                <div className="absolute -top-6 -left-6 size-16 bg-accent/30 rounded-full blur-xl animate-pulse"></div>
                <h2 className="relative text-text-main-light text-3xl md:text-5xl font-black leading-tight tracking-tight">Top Picks for Families</h2>
                <p className="relative text-lg text-text-sub-light mt-3 font-medium">
                  Curated destinations with the highest <span className="text-primary font-bold">toddler happiness</span> ratings.
                </p>
              </div>

              {/* Category Dropdown */}
              <div className="relative min-w-[200px]">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between w-full gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 font-bold text-text-main-light hover:border-primary/30 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">{selectedFilter.icon}</span>
                    <span>{selectedFilter.name}</span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-40 animate-scaleIn origin-top-right">
                      <div className="p-2">
                        {filters.map(filter => (
                          <button
                            key={filter.name}
                            onClick={() => handleFilterChange(filter.name)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeFilter === filter.name
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-sub-light hover:bg-slate-50'
                              }`}
                          >
                            <span className="material-symbols-outlined text-xl">{filter.icon}</span>
                            {filter.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {convexDestinations === undefined && dbDestinations.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[400px] rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : displayedDestinations.length > 0 ? (
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
              <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 transition-all">
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-400">search_off</span>
                </div>
                <h3 className="text-2xl font-black text-text-main-light">No matches found</h3>
                <p className="text-text-sub-light mt-3 max-w-md mx-auto leading-relaxed">
                  We couldn&apos;t find any {activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}destinations matching <span className="font-bold text-primary">&quot;{searchTerm}&quot;</span>.
                  Try another search or reset filters.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter('All');
                    }}
                    className="rounded-2xl"
                  >
                    Reset Everything
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Blog Section */}
        <BlogSection />
      </main>
    </div>
  );
}
