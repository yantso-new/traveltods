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
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <LoadingSpinner />
                <p className="text-stone-500 font-light animate-pulse">
                    {isGathering ? `Gathering data for ${id}...` : "Loading..."}
                </p>
            </div>
        );
    }

    if (!destination) {
        return <div className="p-10 text-center">Destination not found and could not be gathered.</div>;
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
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Header Image */}
            <div className="relative h-[40vh] md:h-[50vh] w-full">
                <img
                    src={destination.image || "/placeholder.jpg"}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent" />
                <div className="absolute top-6 left-6">
                    <Button variant="ghost" onClick={() => router.push('/')} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md rounded-full px-4">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                </div>
                <div className="absolute bottom-8 left-6 md:left-12 max-w-4xl">
                    <Badge className="bg-rose-500/90 text-white border-none mb-4 shadow-sm text-sm px-3 py-1">{destination.country}</Badge>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 shadow-sm">{destination.name}</h1>
                    <p className="text-white/90 text-lg md:text-xl max-w-2xl shadow-sm font-light">{destination.shortDescription}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Description */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Data Quality Warning (if incomplete) */}
                    {dataQuality && !dataQuality.hasReliableOverallScore && (
                        <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-800">Limited Data Available</h4>
                                    <p className="text-amber-700 text-sm mt-1">
                                        Not enough verified data to provide an overall family score.
                                        Individual metrics shown may use estimated values.
                                    </p>
                                    <p className="text-amber-600 text-xs mt-2">
                                        Data completeness: {dataQuality.completenessScore}%
                                        ({dataQuality.completedMetrics.length}/9 metrics verified)
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Refreshing indicator */}
                    {isRefreshing && (
                        <Card className="p-3 bg-blue-50 border-blue-200 shadow-sm">
                            <div className="flex items-center gap-2 text-blue-700">
                                <LoadingSpinner />
                                <span className="text-sm">Refreshing data with latest information...</span>
                            </div>
                        </Card>
                    )}

                    {/* Main Info Card */}
                    <Card className="p-8 shadow-md">
                        <h2 className="text-2xl font-bold text-stone-800 mb-4">About this destination</h2>
                        <p className="text-stone-600 leading-relaxed text-lg mb-6 font-light">
                            {destination.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {destination.tags?.map((tag: string) => (
                                <Badge key={tag} className="text-sm py-1.5 px-3 bg-stone-100 text-stone-600 border-stone-200">{tag}</Badge>
                            ))}
                        </div>
                    </Card>

                    {/* Detailed Metrics Breakdown */}
                    <Card className="p-8 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-stone-800">Family Compatibility Scores</h3>
                                <Tooltip content="Scores are calculated based on data from OpenStreetMap, OpenTripMap, and other public sources.">
                                    <Info className="w-4 h-4 text-stone-400 cursor-help" />
                                </Tooltip>
                            </div>
                            {allScores.familyScore !== undefined && allScores.familyScore !== null ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-stone-500">Overall:</span>
                                    <span className="text-2xl font-bold text-rose-500">{allScores.familyScore}</span>
                                    <span className="text-sm text-stone-400">/100</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-stone-400">
                                    <Info className="w-4 h-4" />
                                    <span className="text-sm">Score unavailable</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <ProgressBar
                                value={allScores.safety}
                                max={100}
                                label="Safety & Security"
                                icon={<ShieldCheck className="w-4 h-4" />}
                                color="bg-emerald-300"
                            />
                            <ProgressBar
                                value={allScores.weatherComfort ?? 50}
                                max={100}
                                label="Weather Comfort"
                                icon={<CloudSun className="w-4 h-4" />}
                                color="bg-sky-300"
                            />
                            <ProgressBar
                                value={allScores.playgrounds}
                                max={100}
                                label="Playgrounds & Parks"
                                icon={<Trees className="w-4 h-4" />}
                                color="bg-green-300"
                            />
                            <ProgressBar
                                value={allScores.costAffordability ?? 50}
                                max={100}
                                label="Cost Affordability"
                                icon={<DollarSign className="w-4 h-4" />}
                                color="bg-amber-300"
                            />
                            <ProgressBar
                                value={allScores.kidActivities}
                                max={100}
                                label="Kid Activities"
                                icon={<Smile className="w-4 h-4" />}
                                color="bg-yellow-300"
                            />
                            <ProgressBar
                                value={allScores.healthyFood}
                                max={100}
                                label="Healthy Food Options"
                                icon={<Utensils className="w-4 h-4" />}
                                color="bg-orange-300"
                            />
                            <ProgressBar
                                value={allScores.strollerFriendly}
                                max={100}
                                label="Stroller Friendly"
                                icon={<Baby className="w-4 h-4" />}
                                color="bg-pink-300"
                            />
                            <ProgressBar
                                value={allScores.accessibility}
                                max={100}
                                label="General Accessibility"
                                icon={<Accessibility className="w-4 h-4" />}
                                color="bg-purple-300"
                            />
                            <ProgressBar
                                value={allScores.sidewalks}
                                max={100}
                                label="Sidewalk Quality"
                                icon={<Footprints className="w-4 h-4" />}
                                color="bg-slate-300"
                            />
                        </div>
                    </Card>
                </div>

                {/* Right Column: Visualization & AI Chat */}
                <div className="space-y-8">

                    {/* Radar Chart */}
                    <Card className="p-6 flex flex-col items-center justify-center bg-white shadow-md">
                        <h3 className="text-lg font-semibold text-stone-800 mb-4 self-start">Visual Breakdown</h3>
                        <div className="w-full h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChart}>
                                    <PolarGrid stroke="#f5f5f4" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 11 }} />
                                    <Radar
                                        name={destination.name}
                                        dataKey="A"
                                        stroke="#fb7185"
                                        fill="#fda4af"
                                        fillOpacity={0.4}
                                    />
                                    <ChartTooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Local Travel Guide */}
                    <Card className="p-0 overflow-hidden flex flex-col h-[500px] shadow-md border-rose-100">
                        <div className="p-4 bg-gradient-to-r from-rose-400 to-rose-300 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                <span className="font-semibold">Local Travel QA</span>
                            </div>
                            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">Beta</Badge>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-stone-400 mt-10 text-sm p-4">
                                    <p>Ask anything! e.g.</p>
                                    <p className="italic mt-2">"Where can I buy diapers?"</p>
                                    <p className="italic">"Is the tap water safe?"</p>
                                </div>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                                        ? 'bg-rose-400 text-white rounded-br-none shadow-sm'
                                        : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatting && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <LoadingSpinner />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-white border-t border-stone-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                    placeholder="Ask a question..."
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none text-sm transition-all text-stone-600"
                                />
                                <button
                                    onClick={handleChat}
                                    disabled={!chatInput.trim() || isChatting}
                                    className="absolute right-2 top-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors disabled:opacity-50"
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
