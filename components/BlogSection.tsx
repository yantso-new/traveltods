'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS, getFeaturedPost } from '@/blogData';
import { BlogCard, FeaturedBlogCard } from '@/components/BlogCard';

export const BlogSection: React.FC = () => {
    const featuredPost = getFeaturedPost();
    const recentPosts = BLOG_POSTS.filter(post => !post.featured).slice(0, 3);

    if (!featuredPost) return null;

    return (
        <section className="py-20 px-4 md:px-20 bg-gradient-to-b from-orange-50/50 to-transparent">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                    <div className="relative">
                        <div className="absolute -top-6 -left-6 size-16 bg-secondary/30 rounded-full blur-xl animate-pulse"></div>
                        <h2 className="relative text-text-main-light text-3xl md:text-5xl font-black leading-tight tracking-tight">
                            Travel Tips & Stories
                        </h2>
                        <p className="relative text-lg text-text-sub-light mt-3 font-medium">
                            Expert advice and inspiration from our <span className="text-secondary font-bold">community of parents</span>.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all group"
                    >
                        View All Articles
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Featured Post */}
                <div className="mb-10">
                    <FeaturedBlogCard post={featuredPost} />
                </div>

                {/* Recent Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {recentPosts.map(post => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
                </div>
            </div>
        </section>
    );
};
