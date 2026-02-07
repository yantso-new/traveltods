"use client";

import React from 'react';
import { Badge, Button, Card, ProgressBar, LoadingSpinner, Tooltip, Input, Textarea, Label, Checkbox } from '@/components/ui';
import { DestinationCard } from '@/components/DestinationCard';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { Destination } from '@/types';

const mockDestination: Destination = {
    id: 'mock-1',
    name: "Copenhagen",
    country: "Denmark",
    description: "Copenhagen is a fantastic city for families, known for its safety, walkability, and abundance of playgrounds.",
    shortDescription: "A safe and stroller-friendly city with world-class playgrounds and happy vibes.",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&q=80&w=2070",
    metrics: {
        accessibility: 9,
        nature: 8,
        playgrounds: 10,
        healthyFood: 9,
        safety: 10,
        walkability: 10,
        strollerFriendly: 10,
        kidActivities: 9,
        weatherComfort: 7,
        costAffordability: 5,
        sidewalks: 10
    },
    tags: ["Safe", "Playgrounds", "Walkable"],
    familyScore: 8.8,
    hasReliableScore: true
};

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-background p-10 font-display">
            <header className="mb-16">
                <h3 className="text-xl font-bold text-text-main-light mb-4">Badge Variants</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="solid-primary">Solid Primary</Badge>
                    <Badge variant="solid-secondary">Solid Secondary</Badge>
                    <Badge variant="solid-accent">Solid Accent</Badge>
                    <Badge variant="gradient-primary">Gradient Primary</Badge>
                    <Badge variant="gradient-secondary">Gradient Secondary</Badge>
                    <Badge variant="gradient-accent">Gradient Accent</Badge>
                    <Badge variant="subtle-primary">Subtle Primary</Badge>
                    <Badge variant="subtle-secondary">Subtle Secondary</Badge>
                    <Badge variant="subtle-accent">Subtle Accent</Badge>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-text-main-light mb-4">Design System</h1>
                <p className="text-xl text-text-sub-light max-w-2xl">
                    A comprehensive guide to the components, tokens, and primitives used throughout the TravelTods application.
                    Designed for consistency, accessibility, and premium aesthetics.
                </p>
            </header>

            <div className="space-y-24 max-w-7xl mx-auto">

                {/* Colors Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm">1</span>
                        Color Palette
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ColorCard name="Primary" variable="--color-primary" hex="#FF6B6B" />
                        <ColorCard name="Secondary" variable="--color-secondary" hex="#4ECDC4" />
                        <ColorCard name="Accent" variable="--color-accent" hex="#FFE66D" textColor="text-black" />
                        <ColorCard name="Background" variable="--color-background-light" hex="#FFFDF9" border />
                        <ColorCard name="Surface" variable="--color-surface-light" hex="#FFFFFF" border />
                        <ColorCard name="Text Main" variable="--color-text-main-light" hex="#2D3436" />
                        <ColorCard name="Text Sub" variable="--color-text-sub-light" hex="#636e72" />
                    </div>
                </section>

                {/* Typography Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white text-sm">2</span>
                        Typography
                    </h2>
                    <Card className="p-8 space-y-8">
                        <div className="grid gap-8">
                            <div className="space-y-2">
                                <span className="text-sm text-text-sub-light font-mono">Display / 5XL / Black</span>
                                <h1 className="text-5xl font-black">Travel & Discover</h1>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm text-text-sub-light font-mono">Display / 4XL / Bold</span>
                                <h2 className="text-4xl font-bold">Recommended Places</h2>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm text-text-sub-light font-mono">Display / 3XL / Bold</span>
                                <h3 className="text-3xl font-bold">Paris, France</h3>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm text-text-sub-light font-mono">Body / XL / Regular</span>
                                <p className="text-xl text-text-sub-light">The quick brown fox jumps over the lazy dog.</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm text-text-sub-light font-mono">Body / Base / Regular</span>
                                <p className="text-base text-text-sub-light">
                                    Experience the magic of traveling with toddlers. Our carefully curated destinations ensure that both parents and little ones have the time of their lives. Safe, fun, and memorable.
                                </p>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Buttons Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-black text-sm">3</span>
                        Buttons
                    </h2>
                    <Card className="p-8">
                        <div className="flex flex-wrap gap-4 items-center mb-8">
                            <Button>Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button disabled>Disabled</Button>
                            <Button className="w-full sm:w-auto">Wider Button</Button>
                        </div>
                    </Card>
                </section>

                {/* Inputs & Forms Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-text-main-light flex items-center justify-center text-white text-sm">4</span>
                        Inputs & Forms
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input type="email" id="email" placeholder="name@example.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination</Label>
                                <Input id="destination" placeholder="Where do you want to go?" />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="terms" />
                                <Label htmlFor="terms" className="mb-0 font-medium">Accept terms and conditions</Label>
                            </div>
                        </Card>

                        <Card className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Travel Notes</Label>
                                <Textarea id="notes" placeholder="Any specific requirements for your trip?" />
                            </div>
                            <div className="space-y-2">
                                <Label>Disabled Input</Label>
                                <Input disabled placeholder="Cannot type here" />
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Interactive Elements Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm">5</span>
                        Interactive Elements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 space-y-6">
                            <h3 className="font-bold text-lg mb-4">Progress Bar</h3>
                            <ProgressBar value={3} max={10} label="Fun Factor" />
                            <ProgressBar value={8} max={10} label="Safety Score" color="bg-secondary" />
                        </Card>

                        <Card className="p-8 flex flex-col items-center justify-center gap-6">
                            <h3 className="font-bold text-lg">Loaders & Tooltips</h3>
                            <div className="flex gap-8 items-center">
                                <LoadingSpinner />
                                <Tooltip content="This is a helpful tooltip!">
                                    <Button variant="outline">Hover Me</Button>
                                </Tooltip>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Components Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white text-sm">6</span>
                        Components
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="p-6 h-64 flex flex-col justify-between">
                            <div>
                                <Badge variant="solid-primary" className="mb-2">New</Badge>
                                <h3 className="text-xl font-bold">Standard Card</h3>
                            </div>
                            <p className="text-text-sub-light text-sm">A simple card component with hover effects suitable for most content.</p>
                        </Card>
                        <Card className="p-6 h-64 flex flex-col justify-between bg-surface-light border-primary/20 shadow-xl">
                            <div>
                                <Badge variant="gradient-accent" className="mb-2">Featured</Badge>
                                <h3 className="text-xl font-bold text-primary">Highlighted Card</h3>
                            </div>
                            <Button className="w-full" variant="primary">Action</Button>
                        </Card>
                        <div className="h-64 rounded-3xl bg-surface-light border-2 border-dashed border-slate-300 flex items-center justify-center text-text-sub-light">
                            Empty State / Placeholder
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-6">Feature Components</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="mb-4 text-text-sub-light">Destination Card: Displays a destination with metrics and score.</p>
                            <div className="h-[500px]">
                                <DestinationCard
                                    destination={mockDestination}
                                    onClick={() => console.log('Card clicked')}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="mb-4 text-text-sub-light">Destination Autocomplete: Search input with Geoapify integration.</p>
                            <Card className="p-6 bg-slate-50">
                                <DestinationAutocomplete
                                    onSearch={(q) => console.log('Search', q)}
                                    onSelect={(d) => console.log('Selected', d)}
                                />
                                <div className="mt-32 p-4 text-sm text-slate-400 text-center">
                                    (Dropdown appears on interaction)
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

function ColorCard({ name, variable, hex, textColor = "text-white", border = false }: { name: string, variable: string, hex: string, textColor?: string, border?: boolean }) {
    return (
        <div className={`rounded-2xl overflow-hidden shadow-sm transition-transform duration-200 hover:-translate-y-1 ${border ? 'border border-slate-200' : ''}`}>
            <div
                className={`h-32 flex items-center justify-center ${textColor} font-bold text-lg`}
                style={{ backgroundColor: `var(${variable})` }}
            >
                {name}
            </div>
            <div className="p-4 bg-surface-light">
                <div className="flex justify-between items-center mb-1">
                    <code className="text-xs font-mono text-text-sub-light">{variable}</code>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-main-light">{hex}</span>
                </div>
            </div>
        </div>
    );
}
