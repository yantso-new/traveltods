"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Baby,
    Trees,
    Utensils,
    ShieldCheck,
    Footprints,
    Smile,
    Accessibility,
    CloudSun,
    DollarSign,
    AlertTriangle,
    Info,
    Ticket,
    ExternalLink,
    ShoppingBag
} from 'lucide-react';
// ChatMessage type removed
import { Button, Badge, ProgressBar, Card, LoadingSpinner, Tooltip } from '@/components/ui';
import { Navbar } from '@/components/Navbar';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip as ChartTooltip } from 'recharts';

// Convex Imports
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function DestinationDetails() {
    const params = useParams();
    // Decode URI since the ID is "Copenhagen, Denmark"
    const rawId = params?.id as string;
    const id = rawId ? decodeURIComponent(rawId) : "";

    const router = useRouter();

    // Convex Data
    const destination = useQuery(api.destinations.getDestination, { name: id });
    const gatherDestination = useAction(api.destinations.gatherDestination);
    const checkAndRefreshIfStale = useAction(api.update_all.checkAndRefreshIfStale);
    const incrementSearchCount = useMutation(api.destinations.incrementSearchCount);

    const [isGathering, setIsGathering] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Track if we have initiated gathering to prevent loops
    const gatheringRef = useRef(false);
    const refreshCheckRef = useRef(false);

    // Viator Activities Data
    // @ts-ignore
    const fetchActivities = useAction(api.viator.fetchActivities);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    useEffect(() => {
        if (id) {
            setIsLoadingActivities(true);
            fetchActivities({ destinationName: id })
                .then((data: any) => {
                    setActivities(data);
                    setIsLoadingActivities(false);
                })
                .catch((err: any) => {
                    console.error("Failed to fetch activities:", err);
                    setIsLoadingActivities(false);
                });
        }
    }, [id, fetchActivities]);

    // Gather new destination if not found
    useEffect(() => {
        if (!id) return;

        if (destination === null && !gatheringRef.current && !isGathering) {
            gatheringRef.current = true;
            setIsGathering(true);

            const parts = id.split(',');
            const city = parts[0]?.trim() || id;
            const country = parts[1]?.trim() || "Unknown";

            gatherDestination({ city, country })
                .then(() => setIsGathering(false))
                .catch(e => {
                    console.error("Gathering failed", e);
                    setIsGathering(false);
                });
        }
    }, [id, destination, gatherDestination, isGathering]);

    // Check for stale data and refresh if needed (lazy refresh for non-top-100)
    useEffect(() => {
        if (!id || !destination || refreshCheckRef.current) return;

        refreshCheckRef.current = true;

        // Increment search count for popularity tracking
        incrementSearchCount({ name: id }).catch(console.error);

        // Check if data is stale and needs refresh
        checkAndRefreshIfStale({ name: id })
            .then(result => {
                if (result.needsRefresh && result.reason === "stale_data_refreshed") {
                    setIsRefreshing(true);
                    // The query will update automatically when the refresh completes
                    setTimeout(() => setIsRefreshing(false), 3000);
                }
            })
            .catch(console.error);
    }, [id, destination, checkAndRefreshIfStale, incrementSearchCount]);

    // Show loading if undefined (connecting) or gathering
    if (destination === undefined || isGathering) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-background-light">
                <LoadingSpinner />
                <p className="text-text-sub-light font-light animate-pulse">
                    {isGathering ? `Gathering data for ${id}...` : "Loading..."}
                </p>
            </div>
        );
    }

    if (!destination) {
        return <div className="p-10 text-center text-text-main-light">Destination not found and could not be gathered.</div>;
    }

    const { allScores, radarChart, dataQuality } = destination;
    const isUnreliable = dataQuality && !dataQuality.hasReliableOverallScore;

    const handleGoHome = () => {
        router.push('/');
    };


    return (
        <div className="min-h-screen bg-background-light text-text-main-light transition-colors duration-200 pb-20">
            {/* Header */}
            <Navbar />

            {/* Hero Banner */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${destination.image || '/placeholder.jpg'}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full px-4 md:px-20 pb-20 flex justify-center">
                    <div className="max-w-7xl w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-accent text-amber-900 border border-amber-900/10 shadow-lg text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">public</span>
                            {destination.country}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-md tracking-tight leading-none">{destination.name}</h1>
                        <p className="text-white/90 text-lg md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">{destination.shortDescription}</p>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-20 -mt-10 relative z-10 flex justify-center">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Description */}
                    <div className="lg:col-span-2 space-y-8">



                        {/* Refreshing indicator */}
                        {isRefreshing && (
                            <Card className="p-4 bg-blue-50 border border-blue-100">
                                <div className="flex items-center gap-3 text-blue-700">
                                    <LoadingSpinner />
                                    <span className="font-semibold">Refreshing data with latest sources...</span>
                                </div>
                            </Card>
                        )}

                        {/* Main Info Card */}
                        <Card className="p-8">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <span className="material-symbols-outlined">info</span>
                                <h2 className="text-xl font-bold uppercase tracking-wide text-text-sub-light">About</h2>
                            </div>
                            <p className="text-text-main-light leading-loose text-lg font-light">
                                {destination.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-8">
                                {destination.tags?.map((tag: string) => (
                                    <Badge key={tag} className="px-4 py-2 text-sm">{tag}</Badge>
                                ))}
                            </div>
                        </Card>

                        {/* Detailed Metrics Breakdown */}
                        <Card className="p-8">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-2xl font-black text-text-main-light">Family Score</h3>
                                    <p className="text-text-sub-light text-sm mt-1">Based on verifiable safety & amenity data</p>
                                </div>

                                {allScores.familyScore !== undefined && allScores.familyScore !== null ? (
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black text-primary">{allScores.familyScore}</span>
                                        <span className="text-base font-bold text-text-sub-light mb-1">/100</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-text-sub-light">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">N/A</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <ProgressBar
                                    value={allScores.safety}
                                    max={100}
                                    label="Safety & Security"
                                    icon={<ShieldCheck className="w-4 h-4" />}
                                    color="bg-emerald-400"
                                />
                                <ProgressBar
                                    value={allScores.kidActivities}
                                    max={100}
                                    label="Kid Activities"
                                    icon={<Smile className="w-4 h-4" />}
                                    color="bg-yellow-400"
                                />
                                <ProgressBar
                                    value={allScores.weatherComfort ?? 50}
                                    max={100}
                                    label="Weather Comfort"
                                    icon={<CloudSun className="w-4 h-4" />}
                                    color="bg-sky-400"
                                />
                                <ProgressBar
                                    value={allScores.costAffordability ?? 50}
                                    max={100}
                                    label="Affordability"
                                    icon={<DollarSign className="w-4 h-4" />}
                                    color="bg-amber-400"
                                />
                                <ProgressBar
                                    value={allScores.playgrounds}
                                    max={100}
                                    label="Playgrounds"
                                    icon={<Trees className="w-4 h-4" />}
                                    color="bg-green-400"
                                />
                                <ProgressBar
                                    value={allScores.healthyFood}
                                    max={100}
                                    label="Healthy Food"
                                    icon={<Utensils className="w-4 h-4" />}
                                    color="bg-orange-400"
                                />
                                {/* Consolidated Walkability & Access */}
                                <ProgressBar
                                    value={Math.round(((allScores.strollerFriendly || 0) + (allScores.accessibility || 0) + (allScores.sidewalks || 0)) / 3)}
                                    max={100}
                                    label="Walkability & Access"
                                    icon={<Accessibility className="w-4 h-4" />}
                                    color="bg-purple-400"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Visualization & AI Chat */}
                    <div className="space-y-8">

                        {/* Radar Chart */}
                        <Card className="p-6 flex flex-col items-center justify-center bg-surface-light">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-sub-light mb-6 self-start">Metrics Visualized</h3>
                            <div className="w-full h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChart}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                        <Radar
                                            name={destination.name}
                                            dataKey="A"
                                            stroke="#FF6B6B"
                                            fill="#FF6B6B"
                                            fillOpacity={0.3}
                                        />
                                        <ChartTooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Affiliate: Baby Gear Rental (BabyQuip) */}
                        <Card className="overflow-hidden border-2 border-transparent hover:border-sky-200 transition-all duration-300">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-sky-100 rounded-xl text-sky-700">
                                        <Baby className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-main-light">Rent Baby Gear</h3>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-sub-light">Powered by BabyQuip</p>
                                    </div>
                                </div>
                                <p className="text-sm text-text-sub-light leading-relaxed">
                                    Travel light! Rent strollers, cribs, and car seats delivered to your location.
                                </p>
                                <Button
                                    className="w-full bg-sky-400 hover:bg-sky-500 text-white border-none group"
                                    onClick={() => window.open('https://www.babyquip.com', '_blank')}
                                >
                                    <span className="font-bold">View Rental Equipment</span>
                                    <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>

            {/* NEW: Book Activities Section */}
            <div className="px-4 md:px-20 mt-16 flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-text-main-light mb-2">Book Activities</h2>
                            <p className="text-text-sub-light text-lg">Top rated experiences for families with kids under 10</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-text-sub-light bg-surface-light px-4 py-2 rounded-full border border-gray-100">
                            <span className="font-semibold text-primary">Powered by Viator</span>
                            <ExternalLink className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoadingActivities ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="h-48 flex items-center justify-center">
                                    <LoadingSpinner />
                                </Card>
                            ))
                        ) : activities.length > 0 ? (
                            activities.map((activity) => (
                                <Card key={activity.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col" onClick={() => window.open(activity.productUrl, '_blank')}>
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={activity.image || '/placeholder.jpg'}
                                            alt={activity.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                            {activity.duration}
                                        </div>
                                        {activity.badge && (
                                            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                                {activity.badge}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center gap-1 mb-2 text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(activity.rating) ? 'fill-current' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs text-text-sub-light ml-1 font-medium">({activity.reviews})</span>
                                        </div>
                                        <h3 className="font-bold text-text-main-light mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{activity.title}</h3>
                                        <p className="text-xs text-text-sub-light mb-4 flex items-center gap-1">
                                            <Baby className="w-3 h-3" />
                                            Family Friendly
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-xs text-text-sub-light">From</p>
                                                <p className="font-black text-lg text-primary">${activity.price?.toFixed(2)}</p>
                                            </div>
                                            <Button className="h-8 px-4 py-1 text-xs bg-surface-light text-text-main-light hover:bg-primary hover:text-white border-transparent shadow-none hover:shadow-md transition-all">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-text-sub-light">
                                <p>No activities found via Viator.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-10 text-center">
                        <Button
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-8 py-6 h-auto text-lg hover:shadow-lg transition-all"
                            onClick={() => window.open('https://www.viator.com', '_blank')}
                        >
                            View All Family Activities
                            <ExternalLink className="w-5 h-5 ml-2 opacity-70" />
                        </Button>
                    </div>
                </div>
            </div>
            {/* Unreliable Data Blocking Modal */}
            {isUnreliable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl scale-100">
                        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-2">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-text-main-light mb-3">Data Unavailable</h2>
                            <p className="text-text-sub-light leading-relaxed">
                                We currently don't have enough verified information for <strong>{destination.name}</strong>.
                                Please try searching for another popular destination.
                            </p>
                        </div>
                        <Button onClick={handleGoHome} className="w-full h-12 text-base">
                            Back to Home
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
