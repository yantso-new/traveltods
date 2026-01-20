"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { Search } from 'lucide-react';

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (pathname !== '/') {
            setShowSearch(true);
            return;
        }

        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowSearch(true);
            } else {
                setShowSearch(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-surface-light/80 backdrop-blur-md transition-all duration-300">
            <div className="px-4 md:px-20 py-3 flex justify-center">
                <div className="w-full max-w-7xl flex flex-col gap-0">
                    <div className="flex items-center justify-between gap-4 w-full">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => router.push('/')}>
                            <div className="flex items-center justify-center size-10 md:size-12 rounded-xl bg-white overflow-hidden shadow-lg border border-orange-50">
                                <img src="/logo.png" alt="TravelTods Logo" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-text-main-light hidden sm:block">TravelTods</h2>
                        </div>

                        {/* Desktop Search Bar */}
                        <div className={`hidden lg:block flex-1 max-w-xl transition-all duration-500 ease-in-out transform ${showSearch ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
                            <div className="relative group">
                                <DestinationAutocomplete
                                    placeholder="Search destinations..."
                                    className="w-full py-2 pl-10 pr-4 bg-white/50 border-orange-100 focus:bg-white shadow-sm rounded-full text-sm h-11"
                                    onSelect={(dest) => {
                                        const destinationName = `${dest.name}, ${dest.country}`;
                                        router.push(`/destination/${encodeURIComponent(destinationName)}`);
                                    }}
                                    onSearch={(query) => {
                                        router.push(`/destination/${encodeURIComponent(query)}`);
                                    }}
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400">
                                    <Search className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
                            <nav className="flex items-center gap-8">
                                <a className="text-sm font-bold text-text-main-light hover:text-primary transition-colors" href="/">Home</a>
                                <a className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors" href="#">About</a>
                            </nav>
                            <Button variant="primary" className="rounded-full h-11 px-7" onClick={() => { /* Join community logic */ }}>
                                <span className="truncate">Join Community</span>
                            </Button>
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <Button
                                variant="outline"
                                className={`rounded-full border-orange-100 !p-2 !w-10 !h-10 transition-colors ${showSearch ? 'bg-orange-50' : ''}`}
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
                                className="w-full py-2 pl-10 pr-4 bg-white/50 border-orange-100 focus:bg-white shadow-sm rounded-full text-sm h-11"
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
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
