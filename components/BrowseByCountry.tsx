"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, TrendingUp, Star } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui';

export function BrowseByCountry() {
    const router = useRouter();
    const countries = useQuery(api.destinations.getAllCountries);

    if (countries === undefined) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (countries.length === 0) {
        return (
            <div className="text-center py-12 text-text-sub-light">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No countries available yet. Check back soon!</p>
            </div>
        );
    }

    // Show top 12 countries with most destinations
    const topCountries = countries.slice(0, 12);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topCountries.map((country) => (
                <Card
                    key={country.name}
                    onClick={() => router.push(`/country/${encodeURIComponent(country.name)}`)}
                    className="p-6 hover:scale-105 transition-transform duration-200"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold text-text-main-light line-clamp-1">
                                {country.name}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-secondary" />
                            <span className="text-text-sub-light font-medium">
                                {country.destinationCount} {country.destinationCount === 1 ? 'destination' : 'destinations'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-accent fill-accent" />
                            <span className="text-text-sub-light font-medium">
                                Avg score: {Math.round(country.avgFamilyScore / 10)}/10
                            </span>
                        </div>

                        {country.topDestination && (
                            <div className="pt-2 border-t border-slate-100">
                                <p className="text-xs text-text-sub-light">
                                    Top pick: <span className="font-semibold text-primary">{country.topDestination}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}
