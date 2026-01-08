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
    Send,
    Bot,
    CloudSun,
    DollarSign,
    AlertTriangle,
    Info
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { Button, Badge, ProgressBar, Card, LoadingSpinner, Tooltip } from '@/components/ui';

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

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);

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

    const handleChat = async () => {
        if (!chatInput.trim()) return;
        const newMsg: ChatMessage = { role: 'user', text: chatInput };
        setChatMessages(prev => [...prev, newMsg]);
        setChatInput('');
        setIsChatting(true);

        setTimeout(() => {
            setChatMessages(prev => [...prev, { role: 'model', text: `Here is some information about ${id}! (Live chat coming soon)` }]);
            setIsChatting(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-background-light text-text-main-light transition-colors duration-200 pb-20">
            {/* Header - Reusing Home Page Header */}
            <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-surface-light/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                            <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-3xl">child_care</span>
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-text-main-light">Traveltods</h2>
                        </div>
                        <div className="hidden md:flex flex-1 justify-end items-center gap-8">
                            <nav className="flex items-center gap-8">
                                <a className="text-sm font-bold text-text-main-light hover:text-primary transition-colors" href="#">Home</a>
                                <a className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors" href="#">About Us</a>
                                <a className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors" href="#">Contact</a>
                            </nav>
                            <Button variant="primary" className="rounded-full h-11 px-7">
                                <span className="truncate">Join Community</span>
                            </Button>
                        </div>
                        <button className="md:hidden p-2 text-text-main-light">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${destination.image || "/placeholder.jpg"}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-accent text-amber-900 border border-amber-900/10 shadow-lg text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">public</span>
                            {destination.country}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-md tracking-tight leading-none">{destination.name}</h1>
                        <p className="text-white/90 text-lg md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">{destination.shortDescription}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Description */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Data Quality Warning */}
                    {dataQuality && !dataQuality.hasReliableOverallScore && (
                        <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/50">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-800 text-lg">Limited Data Available</h4>
                                    <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                                        We're still collecting verified data for this location. Some scores may be estimated.
                                    </p>
                                    <p className="text-amber-600 text-xs mt-2 font-mono">
                                        Completeness: {dataQuality.completenessScore}%
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <ProgressBar
                                value={allScores.safety}
                                max={100}
                                label="Safety & Security"
                                icon={<ShieldCheck className="w-4 h-4" />}
                                color="bg-emerald-400"
                            />
                            <ProgressBar
                                value={allScores.weatherComfort ?? 50}
                                max={100}
                                label="Weather Comfort"
                                icon={<CloudSun className="w-4 h-4" />}
                                color="bg-sky-400"
                            />
                            <ProgressBar
                                value={allScores.playgrounds}
                                max={100}
                                label="Playgrounds"
                                icon={<Trees className="w-4 h-4" />}
                                color="bg-green-400"
                            />
                            <ProgressBar
                                value={allScores.costAffordability ?? 50}
                                max={100}
                                label="Affordability"
                                icon={<DollarSign className="w-4 h-4" />}
                                color="bg-amber-400"
                            />
                            <ProgressBar
                                value={allScores.kidActivities}
                                max={100}
                                label="Kid Activities"
                                icon={<Smile className="w-4 h-4" />}
                                color="bg-yellow-400"
                            />
                            <ProgressBar
                                value={allScores.healthyFood}
                                max={100}
                                label="Healthy Food"
                                icon={<Utensils className="w-4 h-4" />}
                                color="bg-orange-400"
                            />
                            <ProgressBar
                                value={allScores.strollerFriendly}
                                max={100}
                                label="Stroller Access"
                                icon={<Baby className="w-4 h-4" />}
                                color="bg-pink-400"
                            />
                            <ProgressBar
                                value={allScores.accessibility}
                                max={100}
                                label="Accessibility"
                                icon={<Accessibility className="w-4 h-4" />}
                                color="bg-purple-400"
                            />
                            <ProgressBar
                                value={allScores.sidewalks}
                                max={100}
                                label="Walkability"
                                icon={<Footprints className="w-4 h-4" />}
                                color="bg-indigo-400"
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

                    {/* Local Travel Chat */}
                    <Card className="p-0 overflow-hidden flex flex-col h-[500px] border-none">
                        <div className="p-5 bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                <span className="font-bold">Travel Assistant</span>
                            </div>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">BETA</span>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-text-sub-light mt-10 text-sm p-4">
                                    <p className="font-medium">Planning a trip?</p>
                                    <p className="mt-2 text-xs opacity-70">Ask about baby changing spots, supermarkets, or safe nap areas.</p>
                                </div>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/20'
                                        : 'bg-white border border-slate-100 text-text-main-light rounded-bl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatting && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <LoadingSpinner />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-white border-t border-slate-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                    placeholder="Ask anything..."
                                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium text-text-main-light placeholder:text-text-sub-light/50"
                                />
                                <button
                                    onClick={handleChat}
                                    disabled={!chatInput.trim() || isChatting}
                                    className="absolute right-2 top-2 p-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-slate-200"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
