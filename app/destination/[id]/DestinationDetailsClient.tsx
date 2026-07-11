"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    ShoppingBag,
    MapPin,
} from 'lucide-react';
// ChatMessage type removed
import { Button, Badge, ProgressBar, Card, LoadingSpinner, Tooltip } from '@/components/ui';
import { Navbar } from '@/components/Navbar';
import { LoadingOverlay } from '@/components/LoadingOverlay';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip as ChartTooltip } from 'recharts';

// Convex Imports
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { track } from '@vercel/analytics';

function hasSuggestionContent(suggestions: any) {
    if (!suggestions) return false;

    return Boolean(
        suggestions.freeActivities?.length ||
        suggestions.downtime?.length ||
        suggestions.cafes?.length ||
        suggestions.restaurants?.length
    );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
        }),
    ]);
}

function getSpotMapsUrl(spot: any, destinationName: string) {
    if (spot.coordinates?.lat && spot.coordinates?.lon) {
        return `https://www.google.com/maps/search/?api=1&query=${spot.coordinates.lat},${spot.coordinates.lon}`;
    }

    const query = [spot.name, spot.address, destinationName]
        .filter(Boolean)
        .join(', ');

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function formatSpotType(type?: string) {
    return type ? type.replace(/_/g, ' ') : undefined;
}

function normalizeNeighborhoodKey(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[.,]/g, '')
        .replace(/\b(city|municipality|kommun|county|region|province|district)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function filterRealNeighborhoods(neighborhoods: any[] | undefined, destinationName: string) {
    if (!Array.isArray(neighborhoods)) return [];

    const cityName = destinationName.split(',')[0]?.trim() || destinationName;
    const cityKey = normalizeNeighborhoodKey(cityName);
    const seen = new Set<string>();

    return neighborhoods.filter((hood) => {
        const name = typeof hood?.name === 'string' ? hood.name : '';
        const key = normalizeNeighborhoodKey(name);
        if (!key || key === cityKey || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function SpotLinkCard({
    spot,
    destinationName,
    icon,
    iconClassName,
    iconContainerClassName,
    children,
}: {
    spot: any;
    destinationName: string;
    icon: React.ReactNode;
    iconClassName?: string;
    iconContainerClassName: string;
    children?: React.ReactNode;
}) {
    const mapsUrl = getSpotMapsUrl(spot, destinationName);
    const rating = typeof spot.rating === 'number' ? spot.rating.toFixed(1) : null;

    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${spot.name} in Google Maps`}
            className="group block rounded-3xl border border-[var(--border)] bg-surface-light p-4 text-text-main-light transition-colors duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconContainerClassName}`}>
                    <span className={iconClassName}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-text-main-light mb-1 group-hover:text-primary transition-colors">{spot.name}</h4>
                        <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-sub-light/50 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="space-y-1 text-xs text-text-sub-light">
                        {formatSpotType(spot.type) && <p className="capitalize">{formatSpotType(spot.type)}</p>}
                        {spot.address && <p className="line-clamp-1">{spot.address}</p>}
                        {(rating || spot.priceLevel) && (
                            <p className="font-semibold">
                                {rating && <span>{rating} rating</span>}
                                {rating && spot.priceLevel && <span> · </span>}
                                {spot.priceLevel && <span>{spot.priceLevel}</span>}
                            </p>
                        )}
                    </div>

                    {spot.description && (
                        <p className="text-sm text-text-sub-light line-clamp-2 mt-2">{spot.description}</p>
                    )}

                    {children}
                </div>
            </div>
        </a>
    );
}

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
    const [localSuggestions, setLocalSuggestions] = useState<any>(null);
    const realNeighborhoods = filterRealNeighborhoods(destination?.neighborhoods, destination?.name ?? id);

    // Sync localSuggestions with destination.suggestions when destination loads/changes
    useEffect(() => {
        setLocalSuggestions(destination?.suggestions ?? null);
    }, [id, destination?.suggestions]);

    // Refresh suggestions action
    const refreshSuggestionsAction = useAction(api.refresh_suggestions.refreshSuggestions);

    // Track if we have initiated gathering to prevent loops
    const gatheringRef = useRef(false);
    const initialLoadRef = useRef<string | null>(null);

    // Viator Activities Data
    // @ts-ignore
    const fetchActivities = useAction(api.viator.fetchActivities);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    // Gather new destination if not found
    useEffect(() => {
        if (!id) return;

        if (destination === null && !gatheringRef.current && !isGathering) {
            const parts = id.split(',');
            const city = parts[0]?.trim();
            const country = parts[1]?.trim();

            if (!city || !country) {
                return;
            }

            gatheringRef.current = true;
            setIsGathering(true);

            withTimeout(gatherDestination({ city, country }), 15000, 'Destination gathering')
                .then(() => setIsGathering(false))
                .catch(e => {
                    console.error("Gathering failed", e);
                    setIsGathering(false);
                });
        }
    }, [id, destination, gatherDestination, isGathering]);

    // Refresh noncritical data in the background. Existing destination content
    // remains visible while activities and suggestions update.
    useEffect(() => {
        if (!id || !destination || initialLoadRef.current === id) return;

        initialLoadRef.current = id;
        setIsLoadingActivities(true);

        const needsSuggestions = !hasSuggestionContent(destination.suggestions);

        const activityPromise = withTimeout(fetchActivities({ destinationName: id }), 12000, 'Activity loading')
            .then((data: any) => {
                setActivities(data);
            })
            .catch((err: any) => {
                console.error("Failed to fetch activities:", err);
                setActivities([]);
            })
            .finally(() => {
                setIsLoadingActivities(false);
            });

        const refreshPromise = withTimeout(checkAndRefreshIfStale({ name: id }), 12000, 'Destination refresh')
            .catch((err: any) => {
                console.error("Stale data refresh check failed:", err);
                return null;
            });

        const suggestionsPromise = needsSuggestions
            ? withTimeout(refreshSuggestionsAction({ destinationName: id }), 12000, 'Suggestion loading')
                .then((result: any) => {
                    if (!result.success) {
                        console.error('Refresh suggestions failed:', result.error);
                    }
                })
                .catch((err: any) => {
                    console.error('Refresh suggestions failed:', err);
                })
            : Promise.resolve();

        void Promise.allSettled([
            incrementSearchCount({ name: id }).catch(console.error),
            refreshPromise,
            suggestionsPromise,
            activityPromise,
        ]);
    }, [id, destination, checkAndRefreshIfStale, fetchActivities, incrementSearchCount, refreshSuggestionsAction]);

    // Show loading overlay while connecting or gathering data
    if (destination === undefined || isGathering) {
        return (
            <div className="min-h-screen bg-background-light">
                <Navbar />
                <LoadingOverlay isVisible={true} destinationName={id} />
            </div>
        );
    }

    if (!destination) {
        return <div className="p-10 text-center text-text-main-light">Destination not found and could not be gathered.</div>;
    }

    const { allScores, radarChart, dataQuality } = destination;
    const isUnreliable = dataQuality && !dataQuality.hasReliableOverallScore;
    const suggestions = localSuggestions ?? destination.suggestions;
    const shouldShowSuggestionsSection = hasSuggestionContent(suggestions);

    // Transform radar chart to 1-10 scale
    const radarData = radarChart?.map((item: any) => ({
        ...item,
        A: Math.round(item.A / 10)
    }));

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
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 mb-6 text-white/80 text-sm font-bold uppercase tracking-widest backdrop-blur-sm w-fit px-3 py-1 rounded-lg bg-black/10 border border-white/10">
                            <Link href="/" className="hover:text-primary transition-colors cursor-pointer">Home</Link>
                            <span className="text-white/40">/</span>
                            <span className="text-white">Destination</span>
                        </div>

                        <Link 
                            href={`/country/${encodeURIComponent(destination.country)}`}
                            className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/90 text-primary-foreground border border-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">public</span>
                            {destination.country}
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-md tracking-tight leading-none">{destination.name}</h1>
                        <p className="text-white/90 text-lg md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">{destination.shortDescription}</p>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-20 -mt-10 relative z-10 flex justify-center">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Description */}
                    <div className="lg:col-span-2 space-y-8">

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
                                    <Badge key={tag} variant="subtle-primary" className="px-4 py-2 text-sm">{tag === 'Verified' ? 'Data Reviewed' : tag}</Badge>
                                ))}
                            </div>
                        </Card>

                        {/* Detailed Metrics Breakdown */}
                        <Card className="p-8">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black text-text-main-light">Family Score</h3>
                                            <Tooltip content="We aggregate safety data, playground density, walkability, and kid-specific amenities to calculate this score.">
                                                <div className="cursor-help text-text-sub-light/60 hover:text-primary transition-colors">
                                                    <Info className="w-4 h-4" />
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <p className="text-text-sub-light text-sm mt-1">Detailed breakdown of destination features</p>
                                    </div>
                                </div>

                                {allScores.familyScore !== undefined && allScores.familyScore !== null ? (
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black text-primary">{Math.round(allScores.familyScore / 10)}</span>
                                        <span className="text-base font-bold text-text-sub-light mb-1">/10</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-text-sub-light">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">N/A</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-10">
                                {/* Group: Safety & Well-being */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-sub-light/70 border-l-2 border-primary pl-3">Safety & Comfort</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <ProgressBar
                                            value={Math.round(allScores.safety / 10)}
                                            max={10}
                                            label="Crime & Security"
                                            icon={<ShieldCheck className="w-4 h-4" />}
                                            color="bg-emerald-400"
                                        />
                                        <ProgressBar
                                            value={Math.round((allScores.weatherComfort ?? 50) / 10)}
                                            max={10}
                                            label="Climate Suitability"
                                            icon={<CloudSun className="w-4 h-4" />}
                                            color="bg-sky-400"
                                        />
                                    </div>
                                </div>

                                {/* Group: Entertainment & Logistics */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-sub-light/70 border-l-2 border-secondary pl-3">Activities & Access</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <ProgressBar
                                            value={Math.round(allScores.kidActivities / 10)}
                                            max={10}
                                            label="Kid Attractions"
                                            icon={<Smile className="w-4 h-4" />}
                                            color="bg-yellow-400"
                                        />
                                        <ProgressBar
                                            value={Math.round(allScores.playgrounds / 10)}
                                            max={10}
                                            label="Playground Density"
                                            icon={<Trees className="w-4 h-4" />}
                                            color="bg-green-400"
                                        />
                                        <ProgressBar
                                            value={Math.round(((allScores.strollerFriendly || 0) + (allScores.accessibility || 0) + (allScores.sidewalks || 0)) / 30)}
                                            max={10}
                                            label="Stroller/Wheelchair Access"
                                            icon={<Accessibility className="w-4 h-4" />}
                                            color="bg-purple-400"
                                        />
                                        <ProgressBar
                                            value={Math.round(allScores.healthyFood / 10)}
                                            max={10}
                                            label="Healthy Options"
                                            icon={<Utensils className="w-4 h-4" />}
                                            color="bg-accent-strong"
                                        />
                                    </div>
                                </div>
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
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                        <Radar
                                            name={destination.name}
                                            dataKey="A"
                                            stroke="#3F7C79"
                                            fill="#3F7C79"
                                            fillOpacity={0.3}
                                        />
                                        <ChartTooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Affiliate: Baby Gear Rental (BabyQuip) */}
                        <Card className="overflow-hidden border-2 border-transparent transition-colors duration-200">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-secondary/15 rounded-xl text-secondary">
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
                                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground border-none group"
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

            {/* Neighborhoods Section */}
            {realNeighborhoods.length > 0 && (
                <div className="px-4 md:px-20 mt-16 flex justify-center">
                    <div className="w-full max-w-7xl">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
                                <MapPin className="w-3 h-3" />
                                Local Guide
                            </div>
                            <h2 className="text-3xl font-black text-text-main-light mb-2">Best Neighborhoods for Families</h2>
                            <p className="text-text-sub-light text-lg">Where to stay in <span className="text-primary font-bold">{destination.name}</span></p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realNeighborhoods.slice(0, 6).map((hood: any, idx: number) => (
                                <Card key={`${hood.name}-${idx}`} className="p-6 transition-colors duration-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-text-main-light mb-1">{hood.name}</h3>
                                            {hood.tag && (
                                                <Badge variant="subtle-primary" className="text-xs">{hood.tag}</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-sub-light">Parks & Playgrounds</span>
                                            <div className="flex items-center gap-1">
                                                <Trees className="w-4 h-4 text-green-500" />
                                                <span className="font-bold text-sm">{hood.scores.parks}/10</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-sub-light">Cafés</span>
                                            <div className="flex items-center gap-1">
                                    <Utensils className="w-4 h-4 text-accent-strong" />
                                                <span className="font-bold text-sm">{hood.scores.cafes}/10</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-sub-light">Restaurants</span>
                                            <div className="flex items-center gap-1">
                                    <Utensils className="w-4 h-4 text-secondary" />
                                                <span className="font-bold text-sm">{hood.scores.restaurants}/10</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-sub-light">Safety</span>
                                            <div className="flex items-center gap-1">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <span className="font-bold text-sm">{hood.scores.safety}/10</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-sub-light">Walkability</span>
                                            <div className="flex items-center gap-1">
                                                <Footprints className="w-4 h-4 text-blue-500" />
                                                <span className="font-bold text-sm">{hood.scores.walkability}/10</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Local Suggestions Section */}
            {shouldShowSuggestionsSection && (
                <div className="px-4 md:px-20 mt-16 flex justify-center">
                    <div className="w-full max-w-7xl">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-accent/35 text-accent-strong border border-accent-strong/20 text-[10px] font-black uppercase tracking-widest">
                                <Smile className="w-3 h-3" />
                                Parent Approved
                            </div>
                            <h2 className="text-3xl font-black text-text-main-light mb-2">Family-Friendly Spots</h2>
                            <p className="text-text-sub-light text-lg">Curated recommendations in <span className="text-primary font-bold">{destination.name}</span></p>
                        </div>

                        {/* Free Activities */}
                        {suggestions?.freeActivities && suggestions.freeActivities.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-text-main-light mb-4 flex items-center gap-2">
                                    <Trees className="w-6 h-6 text-green-500" />
                                    Free Activities & Parks
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestions.freeActivities.slice(0, 6).map((activity: any, idx: number) => (
                                        <SpotLinkCard
                                            key={idx}
                                            spot={activity}
                                            destinationName={destination.name}
                                            icon={<Trees className="w-5 h-5 text-green-600" />}
                                            iconContainerClassName="bg-green-100"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Downtime Spots */}
                        {suggestions?.downtime && suggestions.downtime.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-text-main-light mb-4 flex items-center gap-2">
                                    <CloudSun className="w-6 h-6 text-blue-500" />
                                    Quiet Downtime Spots
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestions.downtime.slice(0, 6).map((spot: any, idx: number) => (
                                        <SpotLinkCard
                                            key={idx}
                                            spot={spot}
                                            destinationName={destination.name}
                                            icon={<CloudSun className="w-5 h-5 text-blue-600" />}
                                            iconContainerClassName="bg-blue-100"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cafés */}
                        {suggestions?.cafes && suggestions.cafes.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-text-main-light mb-4 flex items-center gap-2">
                                    <Utensils className="w-6 h-6 text-accent-strong" />
                                    Family-Friendly Cafés
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestions.cafes.slice(0, 6).map((cafe: any, idx: number) => (
                                        <SpotLinkCard
                                            key={idx}
                                            spot={cafe}
                                            destinationName={destination.name}
                                            icon={<Utensils className="w-5 h-5 text-accent-strong" />}
                                            iconContainerClassName="bg-accent/35"
                                        >
                                            {cafe.cuisine && (
                                                <p className="text-xs text-text-sub-light mt-1">{cafe.cuisine}</p>
                                            )}
                                            {cafe.kidFeatures && cafe.kidFeatures.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {cafe.kidFeatures.slice(0, 2).map((feature: string) => (
                                                        <Badge key={feature} variant="subtle-accent" className="text-xs">
                                                            {feature.replace('_', ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </SpotLinkCard>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Restaurants */}
                        {suggestions?.restaurants && suggestions.restaurants.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-text-main-light mb-4 flex items-center gap-2">
                                    <Utensils className="w-6 h-6 text-secondary" />
                                    Kid-Friendly Restaurants
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {suggestions.restaurants.slice(0, 6).map((restaurant: any, idx: number) => (
                                        <SpotLinkCard
                                            key={idx}
                                            spot={restaurant}
                                            destinationName={destination.name}
                                            icon={<Utensils className="w-5 h-5 text-secondary" />}
                                            iconContainerClassName="bg-secondary/10"
                                        >
                                            {restaurant.cuisine && (
                                                <p className="text-xs text-text-sub-light mt-1">{restaurant.cuisine}</p>
                                            )}
                                            {restaurant.kidFeatures && restaurant.kidFeatures.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {restaurant.kidFeatures.slice(0, 2).map((feature: string) => (
                                                        <Badge key={feature} variant="subtle-accent" className="text-xs">
                                                            {feature.replace('_', ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </SpotLinkCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Book Activities Section */}
            <div className="px-4 md:px-20 mt-16 flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-black uppercase tracking-widest">
                                <Baby className="w-3 h-3" />
                                Expert Picks
                            </div>
                            <h2 className="text-3xl font-black text-text-main-light mb-2">Book Activities</h2>
                            <p className="text-text-sub-light text-lg">Hand-picked for under-10s in <span className="text-primary font-bold">{destination.name}</span></p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-text-sub-light bg-surface-light px-4 py-2 rounded-full border border-[var(--border)]">
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
                                <Card key={activity.id} className="group overflow-hidden border-none cursor-pointer h-full flex flex-col transition-colors duration-200" onClick={() => {
                                    track('Affiliate Activity Click', {
                                        destination: destination.name,
                                        activity: activity.title,
                                        provider: 'Viator',
                                    });
                                    window.open(activity.productUrl, '_blank', 'noopener,noreferrer');
                                }}>
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={activity.image || '/placeholder.jpg'}
                                            alt={activity.title}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold">
                                            {activity.duration}
                                        </div>
                                        {activity.badge && (
                                        <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-bold">
                                                {activity.badge}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center gap-1 mb-2 text-accent-strong">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(activity.rating) ? 'fill-current' : 'text-text-sub-light/30'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs text-text-sub-light ml-1 font-medium">({activity.reviews})</span>
                                        </div>
                                        <h3 className="font-bold text-text-main-light mb-2 line-clamp-2 leading-snug">{activity.title}</h3>
                                        <p className="text-xs text-text-sub-light mb-4 flex items-center gap-1">
                                            <Baby className="w-3 h-3" />
                                            Family Friendly
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                            <div>
                                                <p className="text-xs text-text-sub-light">From</p>
                                                <p className="font-black text-lg text-primary">${activity.price?.toFixed(2)}</p>
                                            </div>
                                            <Button className="h-8 px-4 py-1 text-xs bg-surface-light text-text-main-light hover:bg-primary hover:text-white border-transparent transition-colors">
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
                            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 h-auto text-lg transition-colors duration-200"
                            onClick={() => {
                                track('Affiliate Marketplace Click', {
                                    destination: destination.name,
                                    provider: 'Viator',
                                });
                                window.open('https://www.viator.com', '_blank', 'noopener,noreferrer');
                            }}
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
                    <Card className="max-w-md w-full p-8 text-center space-y-6 scale-100">
                        <div className="mx-auto w-20 h-20 bg-accent/35 rounded-full flex items-center justify-center text-accent-strong mb-2">
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
