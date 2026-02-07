'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES, BlogCategory, getFeaturedPost, getPostsByCategory } from '@/blogData';
import { BlogCard, FeaturedBlogCard } from '@/components/BlogCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const featuredPost = getFeaturedPost();

    const filteredPosts = useMemo(() => {
        let posts = getPostsByCategory(activeCategory);

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            posts = posts.filter(
                post =>
                    post.title.toLowerCase().includes(term) ||
                    post.excerpt.toLowerCase().includes(term) ||
                    post.author.name.toLowerCase().includes(term)
            );
        }

        return posts;
    }, [activeCategory, searchTerm]);

    // Show featured post separately only when showing all or if it matches filter
    const showFeatured = featuredPost && activeCategory === 'all' && !searchTerm;
    const gridPosts = showFeatured
        ? filteredPosts.filter(post => post.slug !== featuredPost?.slug)
        : filteredPosts;

    return (
        <div className="relative flex min-h-screen flex-col bg-background-light text-text-main-light">
            <Navbar />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative py-20 md:py-28 px-4 md:px-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
                    <div className="max-w-7xl mx-auto">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-text-sub-light hover:text-primary transition-colors mb-8 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>

                        <div className="relative">
                            <div className="absolute -top-8 -left-8 size-24 bg-primary/20 rounded-full blur-2xl"></div>
                            <div className="absolute top-0 right-0 size-32 bg-secondary/20 rounded-full blur-2xl"></div>

                            <h1 className="relative text-4xl md:text-6xl font-black text-text-main-light leading-tight tracking-tight mb-4">
                                Travel Tips & Stories
                            </h1>
                            <p className="relative text-xl text-text-sub-light font-light max-w-2xl">
                                Expert advice, destination guides, and community stories to make your family adventures unforgettable.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm border-b border-slate-100 py-4 px-4 md:px-20">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {BLOG_CATEGORIES.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${activeCategory === category.id
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-slate-100 text-text-sub-light hover:bg-slate-200'
                                        }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub-light" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border border-transparent focus:border-primary focus:bg-white outline-none text-sm transition-all cursor-text"
                            />
                        </div>
                    </div>
                </section>

                {/* Posts Grid */}
                <section className="py-12 md:py-20 px-4 md:px-20">
                    <div className="max-w-7xl mx-auto">
                        {/* Featured Post (only when showing all) */}
                        {showFeatured && (
                            <div className="mb-12">
                                <FeaturedBlogCard post={featuredPost} />
                            </div>
                        )}

                        {/* Results count */}
                        <p className="text-text-sub-light text-sm mb-6">
                            Showing {gridPosts.length} article{gridPosts.length !== 1 ? 's' : ''}
                            {activeCategory !== 'all' && ` in ${activeCategory}`}
                            {searchTerm && ` matching "${searchTerm}"`}
                        </p>

                        {/* Grid */}
                        {gridPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {gridPosts.map(post => (
                                    <BlogCard key={post.slug} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-stone-300">
                                <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-6 h-6 text-stone-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-stone-700">No articles found</h3>
                                <p className="text-stone-400 mt-2">
                                    Try adjusting your search or filter.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
