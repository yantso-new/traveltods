'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/blogData';
import { Badge } from '@/components/ui';

interface BlogCardProps {
    post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="bg-surface-light rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                        <Badge
                            variant={post.category === 'explore' ? 'solid-primary' : 'solid-secondary'}
                            className="capitalize text-xs font-semibold"
                        >
                            {post.category}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-text-main-light leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <p className="text-text-sub-light text-sm font-light leading-relaxed mb-4 line-clamp-2 flex-1">
                        {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs text-text-sub-light font-medium">
                                {post.author.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-sub-light">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime} min</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
};

interface FeaturedBlogCardProps {
    post: BlogPost;
}

export const FeaturedBlogCard: React.FC<FeaturedBlogCardProps> = ({ post }) => {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="relative bg-surface-light rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                            <Badge variant="gradient-accent" className="text-xs font-bold uppercase tracking-wider">
                                ✨ Featured
                            </Badge>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-10 flex flex-col justify-center">
                        <Badge
                            variant={post.category === 'explore' ? 'solid-primary' : 'solid-secondary'}
                            className="capitalize text-xs font-semibold w-fit mb-4"
                        >
                            {post.category}
                        </Badge>

                        <h2 className="text-2xl md:text-3xl font-black text-text-main-light leading-tight mb-4 group-hover:text-primary transition-colors">
                            {post.title}
                        </h2>

                        <p className="text-text-sub-light text-base font-light leading-relaxed mb-6 line-clamp-3">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <span className="text-sm text-text-main-light font-medium">
                                    {post.author.name}
                                </span>
                            </div>
                            <span className="text-sm text-text-sub-light">{formattedDate}</span>
                            <div className="flex items-center gap-1 text-sm text-text-sub-light">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime} min read</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                            Read Article
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
};
