"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Navbar } from '@/components/Navbar';
import { DestinationCard } from '@/components/DestinationCard';
import { Button, Card, Badge } from '@/components/ui';

export default function CountryPage() {
    const params = useParams();
    const router = useRouter();
    const countrySlug = params?.slug as string;
    const country = countrySlug ? decodeURIComponent(countrySlug) : '';

    // Fetch destinations for this country
    const destinations = useQuery(api.destinations.getDestinationsByCountry, { country });

    if (!country) {
        return (
            <div className="min-h-screen bg-background-light">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <p className="text-text-sub-light">Country not found</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (destinations === undefined) {
        return (
            <div className="min-h-screen bg-background-light">
                <Navbar />
                <div className="px-4 md:px-20 py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-64 bg-slate-200 animate-pulse rounded-3xl mb-8" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-3xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate country stats
    const avgScore = destinations.length > 0
        ? Math.round(destinations.reduce((sum: number, d: any) => sum + (d.allScores?.familyScore || 0), 0) / destinations.length / 10)
        : 0;
    
    const topDestination = destinations[0];
    const totalParks = destinations.reduce((sum: number, d: any) => sum + (d.suggestions?.freeActivities?.length || 0), 0);
    const totalCafes = destinations.reduce((sum: number, d: any) => sum + (d.suggestions?.cafes?.length || 0), 0);

    return (
        <div className="min-h-screen bg-background-light text-text-main-light">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
                </div>
                
                <div className="relative px-4 md:px-20 py-16 md:py-24">
                    <div className="max-w-7xl mx-auto">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to all destinations</span>
                        </Link>

                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-8 h-8 text-white" />
                            <h1 className="text-4xl md:text-6xl font-black text-white">
                                {country}
                            </h1>
                        </div>

                        <p className="text-xl text-white/90 mb-8 max-w-2xl">
                            Discover {destinations.length} family-friendly {destinations.length === 1 ? 'destination' : 'destinations'} with verified scores and local recommendations.
                        </p>

                        {/* Country Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-accent" />
                                    <span className="text-sm text-white/80 font-medium">Avg Score</span>
                                </div>
                                <p className="text-3xl font-black text-white">{avgScore}/10</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-5 h-5 text-accent" />
                                    <span className="text-sm text-white/80 font-medium">Destinations</span>
                                </div>
                                <p className="text-3xl font-black text-white">{destinations.length}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-accent" />
                                    <span className="text-sm text-white/80 font-medium">Parks</span>
                                </div>
                                <p className="text-3xl font-black text-white">{totalParks}+</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-accent" />
                                    <span className="text-sm text-white/80 font-medium">Cafés</span>
                                </div>
                                <p className="text-3xl font-black text-white">{totalCafes}+</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Destinations Grid */}
            <div className="px-4 md:px-20 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-text-main-light mb-2">
                                Top Destinations in {country}
                            </h2>
                            <p className="text-text-sub-light">
                                Ranked by family-friendliness score
                            </p>
                        </div>
                        
                        {topDestination && (
                            <Badge variant="gradient-primary" className="px-4 py-2">
                                <Award className="w-4 h-4 mr-2" />
                                Top Pick: {topDestination.name}
                            </Badge>
                        )}
                    </div>

                    {destinations.length === 0 ? (
                        <Card className="p-12 text-center">
                            <MapPin className="w-16 h-16 text-text-sub-light/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-text-main-light mb-2">
                                No destinations yet
                            </h3>
                            <p className="text-text-sub-light mb-6">
                                We're still gathering data for {country}. Check back soon!
                            </p>
                            <Button onClick={() => router.push('/')}>
                                Explore Other Countries
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {destinations.map((destination: any) => (
                                <DestinationCard
                                    key={destination._id}
                                    destination={{
                                        id: destination.name,
                                        name: destination.name,
                                        country: destination.country,
                                        description: destination.description || '',
                                        shortDescription: destination.shortDescription || '',
                                        image: destination.image || '',
                                        metrics: {
                                            accessibility: (destination.allScores?.accessibility || 0) / 10,
                                            nature: 0,
                                            playgrounds: (destination.allScores?.playgrounds || 0) / 10,
                                            healthyFood: (destination.allScores?.healthyFood || 0) / 10,
                                            safety: (destination.allScores?.safety || 0) / 10,
                                            walkability: (destination.allScores?.sidewalks || 0) / 10,
                                            strollerFriendly: (destination.allScores?.strollerFriendly || 0) / 10,
                                            kidActivities: (destination.allScores?.kidActivities || 0) / 10,
                                            weatherComfort: (destination.allScores?.weatherComfort || 0) / 10,
                                            costAffordability: (destination.allScores?.costAffordability || 0) / 10,
                                            sidewalks: (destination.allScores?.sidewalks || 0) / 10,
                                        },
                                        tags: destination.tags || [],
                                        familyScore: destination.allScores?.familyScore || null,
                                        hasReliableScore: destination.dataQuality?.hasReliableOverallScore || false,
                                    }}
                                    onClick={() => router.push(`/destination/${encodeURIComponent(destination.name)}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
