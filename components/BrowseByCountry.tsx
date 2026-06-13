"use client";

import React, { Component } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui';

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('BrowseByCountry error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center py-8 text-text-sub-light">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Could not load countries. Please try refreshing.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function BrowseByCountryInner() {
    const router = useRouter();
    const countries = useQuery(api.destinations.getAllCountries, {});

    if (countries === undefined) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
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
            {topCountries.map((country: any) => (
                <Card
                    key={country.name}
                    onClick={() => router.push(`/country/${encodeURIComponent(country.name)}`)}
                    className="p-6 transition-colors duration-200"
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
                            <Star className="w-4 h-4 text-accent-strong fill-accent-strong" />
                            <span className="text-text-sub-light font-medium">
                                Avg score: {Math.round(country.avgFamilyScore / 10)}/10
                            </span>
                        </div>

                        {country.topDestination && (
                            <div className="pt-2 border-t border-[var(--border)]">
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

export function BrowseByCountry() {
    return (
        <ErrorBoundary>
            <BrowseByCountryInner />
        </ErrorBoundary>
    );
}
