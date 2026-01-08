"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function Navbar() {
    const router = useRouter();

    return (
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
                        <Button variant="primary" className="rounded-full h-11 px-7" onClick={() => { /* Join community logic */ }}>
                            <span className="truncate">Join Community</span>
                        </Button>
                    </div>
                    <button className="md:hidden p-2 text-text-main-light">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
