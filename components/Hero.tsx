"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';

interface HeroProps {
    onSearchTermChange: (term: string) => void;
}

export function Hero({ onSearchTermChange }: HeroProps) {
    const router = useRouter();

    return (
        <section className="relative">
            <div className="px-4 py-6 md:px-20 md:py-10 flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="relative rounded-3xl bg-slate-900 shadow-2xl shadow-primary/10">
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>
                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCB7gpLzlOmof9T41t9mEly-B-yV1RNfpVYd5WdFsuIhlB9mzNbwtKL9CYDLlZWZjLHcootCrcGQsMpRQw77BaL56pVEIulPmRrM8AsOGxwYU8Fgum0xTA-W9fZM7AcvgXfGnhEIhKq-hkc7-Mkwg9aa6xnQDIaBBSjd5YsU_p5FlZ75I1piBRbFtuKFoDHFPuorLB0AraxpK41cdwIJXchHSNrpDo6PV-TpHs71MFF5H7wo4r-a-WryspGvIGvvcK5LTfNpUBnIfM")' }}>
                            </div>
                        </div>
                        <div className="relative z-20 flex flex-col items-start justify-center min-h-[500px] p-6 md:p-16 max-w-3xl gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-amber-900 shadow-lg shadow-black/10 text-xs font-extrabold uppercase tracking-wider transform -rotate-1">
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

                            <div className="w-full max-w-lg mt-2">
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
