"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { Search } from 'lucide-react';
import { WaitlistModal } from '@/components/WaitlistModal';

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [showSearch, setShowSearch] = useState(false);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

    useEffect(() => {
        if (pathname !== '/') {
            setShowSearch(true);
            return;
        }

        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 380) { // Threshold to show
                setShowSearch(true);
            } else if (scrollY < 340) { // Threshold to hide (hysteresis)
                setShowSearch(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-surface-light/80 backdrop-blur-md transition-all duration-200">
            <div className="px-4 md:px-20 py-3 flex justify-center">
                <div className="w-full max-w-7xl flex flex-col gap-0">
                    <div className="flex items-center justify-between gap-4 w-full">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => router.push('/')}>
                            <div className="flex items-center justify-center size-10 md:size-12 rounded-xl bg-surface-light overflow-hidden shadow-lg border border-slate-100">
                                <img src="/logo.png" alt="TravelTods Logo" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-text-main-light hidden sm:block">TravelTods</h2>
                        </div>

                        {/* Desktop Search Bar */}
                        <div className={`hidden lg:block flex-1 max-w-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showSearch ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'}`}>
                            <div className="relative group">
                                <DestinationAutocomplete
                                    placeholder="Search destinations..."
                                    className="w-full"
                                    variant="minimal"
                                    onSelect={(dest) => {
                                        const destinationName = `${dest.name}, ${dest.country}`;
                                        router.push(`/destination/${encodeURIComponent(destinationName)}`);
                                    }}
                                    onSearch={(query) => {
                                        router.push(`/destination/${encodeURIComponent(query)}`);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
                            <nav className="flex items-center gap-8">
                                <a className="text-sm font-bold text-text-main-light hover:text-primary transition-colors" href="/">Home</a>
                                <a className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors" href="#">About</a>
                            </nav>
                            <Button variant="primary" className="rounded-full h-11 px-7" onClick={() => setIsWaitlistOpen(true)}>
                                <span className="truncate">Join Community</span>
                            </Button>
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <Button
                                variant="outline"
                                className={`rounded-full border-slate-200 !p-2 !w-10 !h-10 transition-colors duration-200 ${showSearch ? 'bg-primary/10' : ''}`}
                                onClick={() => setShowSearch(!showSearch)}
                            >
                                <Search className="w-4 h-4 ml-0" />
                            </Button>
                            <button className="p-2 text-text-main-light">
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar (Expandable) */}
                    <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? 'max-h-20 opacity-100 mt-3 pb-2' : 'max-h-0 opacity-0'}`}>
                        <div className="relative">
                            <DestinationAutocomplete
                                placeholder="Search destinations..."
                                className="w-full py-2 pl-10 pr-4 bg-surface-light/50 border-slate-200 focus:bg-surface-light shadow-sm rounded-full text-sm h-11"
                                onSelect={(dest) => {
                                    const destinationName = `${dest.name}, ${dest.country}`;
                                    router.push(`/destination/${encodeURIComponent(destinationName)}`);
                                    if (window.innerWidth < 1024) setShowSearch(false);
                                }}
                                onSearch={(query) => {
                                    router.push(`/destination/${encodeURIComponent(query)}`);
                                    if (window.innerWidth < 1024) setShowSearch(false);
                                }}
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Waitlist Modal */}
            <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
        </header>
    );
}
