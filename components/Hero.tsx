"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';

interface HeroProps {
    onSearchTermChange: (term: string) => void;
}

export function Hero({ onSearchTermChange }: HeroProps) {
    const router = useRouter();
    const [searchOpacity, setSearchOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY;
            // Transition between 200px and 400px scroll
            const newOpacity = Math.max(0, 1 - (scrollPos - 200) / 200);
            if (scrollPos < 200) setSearchOpacity(1);
            else if (scrollPos > 400) setSearchOpacity(0);
            else setSearchOpacity(newOpacity);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="relative">
            <div className="px-4 py-6 md:px-20 md:py-10 flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="relative rounded-3xl bg-slate-900 shadow-2xl shadow-primary/10 transition-all duration-700">
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>
                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("/hero-family.png")' }}>
                            </div>
                        </div>
                        <div className="relative z-20 flex flex-col items-start justify-center min-h-[500px] p-6 md:p-16 max-w-3xl gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white border border-white/10 shadow-lg shadow-primary/40 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider transform -rotate-1">
                                    <span className="material-symbols-outlined text-base">verified</span>
                                    Parent Verified
                                </div>
                                <h1 className="text-white text-4xl md:text-5xl lg:text-7xl font-black leading-[0.95] tracking-tight drop-shadow-sm">
                                    Adventures tailored for <span className="text-secondary">tiny travelers</span>
                                </h1>
                                <h2 className="text-white/90 text-base md:text-xl font-medium max-w-xl leading-relaxed drop-shadow-md">
                                    Discover top-rated, safe, and engaging destinations perfect for kids under 10. Filter by stroller access, nap-friendliness, and more.
                                </h2>
                            </div>

                            <div
                                className="w-full max-w-lg mt-2 transition-all duration-300"
                                style={{ opacity: searchOpacity, transform: `translateY(${(1 - searchOpacity) * -40}px)` }}
                            >
                                <div className="relative max-w-2xl mx-auto rounded-full group">
                                    <DestinationAutocomplete
                                        placeholder="Where to next? (e.g. Tokyo, Paris)"
                                        className="w-full"
                                        onSelect={(dest) => {
                                            const destinationName = `${dest.name}, ${dest.country}`;
                                            onSearchTermChange(destinationName);
                                            router.push(`/destination/${encodeURIComponent(destinationName)}`);
                                        }}
                                        onSearch={(query) => {
                                            onSearchTermChange(query);
                                            router.push(`/destination/${encodeURIComponent(query)}`);
                                        }}
                                    />
                                </div>

                                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
                                    <span className="text-sm text-white/90 font-bold whitespace-nowrap">Popular:</span>
                                    {['Barcelona', 'Lisbon', 'Tossa de Mar'].map(city => (
                                        <button
                                            key={city}
                                            onClick={() => onSearchTermChange(city)}
                                            className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-colors whitespace-nowrap cursor-pointer"
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
