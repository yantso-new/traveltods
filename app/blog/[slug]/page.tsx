'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '@/blogData';
import { BlogCard } from '@/components/BlogCard';
import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui';

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    const resolvedParams = React.use(params);
    const post = getPostBySlug(resolvedParams.slug);
    const [copied, setCopied] = useState(false);

    if (!post) {
        notFound();
    }

    const relatedPosts = getRelatedPosts(post.slug, 3);

    const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = `${post.title} - TravelTods`;

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
        }
    };

    // Improved markdown-like rendering
    const renderContent = (content: string) => {
        const lines = content.trim().split('\n');
        const elements: React.ReactNode[] = [];
        let inBlockquote = false;
        let blockquoteContent: string[] = [];
        let inList = false;
        let listItems: string[] = [];

        const flushList = (index: number) => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${index}`} className="space-y-2 my-6 ml-4">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-text-main-light leading-relaxed">
                                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                );
                listItems = [];
                inList = false;
            }
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Handle blockquotes
            if (trimmedLine.startsWith('>')) {
                flushList(index);
                inBlockquote = true;
                blockquoteContent.push(trimmedLine.slice(1).trim());
                return;
            } else if (inBlockquote && trimmedLine === '') {
                elements.push(
                    <blockquote key={`bq-${index}`} className="border-l-4 border-secondary pl-6 py-4 my-6 bg-secondary/5 rounded-r-xl">
                        {blockquoteContent.map((bqLine, i) => (
                            <p key={i} className="text-text-sub-light italic text-base leading-relaxed">{bqLine}</p>
                        ))}
                    </blockquote>
                );
                inBlockquote = false;
                blockquoteContent = [];
                return;
            }

            // H1
            if (trimmedLine.startsWith('# ')) {
                flushList(index);
                elements.push(
                    <h1 key={index} className="text-3xl md:text-4xl font-black text-text-main-light mt-12 mb-6 first:mt-0">
                        {trimmedLine.slice(2)}
                    </h1>
                );
            }
            // H2
            else if (trimmedLine.startsWith('## ')) {
                flushList(index);
                elements.push(
                    <h2 key={index} className="text-2xl md:text-3xl font-bold text-text-main-light mt-10 mb-5 border-b border-slate-100 pb-3">
                        {trimmedLine.slice(3)}
                    </h2>
                );
            }
            // H3
            else if (trimmedLine.startsWith('### ')) {
                flushList(index);
                elements.push(
                    <h3 key={index} className="text-xl md:text-2xl font-bold text-text-main-light mt-8 mb-4">
                        {trimmedLine.slice(4)}
                    </h3>
                );
            }
            // List item
            else if (trimmedLine.startsWith('- ')) {
                inList = true;
                listItems.push(trimmedLine.slice(2));
            }
            // Empty line
            else if (trimmedLine === '') {
                flushList(index);
                elements.push(<div key={index} className="h-2" />);
            }
            // Paragraph
            else {
                flushList(index);
                elements.push(
                    <p key={index} className="text-text-main-light text-base md:text-lg leading-relaxed mb-5">
                        {trimmedLine}
                    </p>
                );
            }
        });

        // Handle trailing blockquote or list
        if (inBlockquote && blockquoteContent.length > 0) {
            elements.push(
                <blockquote key="bq-final" className="border-l-4 border-secondary pl-6 py-4 my-6 bg-secondary/5 rounded-r-xl">
                    {blockquoteContent.map((bqLine, i) => (
                        <p key={i} className="text-text-sub-light italic text-base leading-relaxed">{bqLine}</p>
                    ))}
                </blockquote>
            );
        }
        flushList(lines.length);

        return elements;
    };

    return (
        <>
            <Navbar />

            {/* Hero Image */}
            <div className="relative h-72 md:h-[500px] overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Floating badge on hero */}
                <div className="absolute bottom-8 left-4 md:left-20">
                    <Badge
                        variant={post.category === 'explore' ? 'solid-primary' : 'solid-secondary'}
                        className="capitalize text-sm font-bold shadow-lg"
                    >
                        {post.category}
                    </Badge>
                </div>
            </div>

            {/* Article Content */}
            <article className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-text-sub-light hover:text-primary transition-colors mb-8 font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </Link>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-black text-text-main-light leading-tight mb-6">
                    {post.title}
                </h1>

                {/* Excerpt */}
                <p className="text-xl text-text-sub-light leading-relaxed mb-8 font-light">
                    {post.excerpt}
                </p>

                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-10 pb-8 border-b-2 border-slate-100">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-md"
                        />
                        <div>
                            <p className="text-sm font-bold text-text-main-light">{post.author.name}</p>
                            <p className="text-xs text-text-sub-light">Author</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-text-sub-light">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-text-sub-light">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime} min read</span>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-text-sub-light font-semibold mr-1">Share:</span>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="p-2.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer hover:scale-110"
                            aria-label="Share on Twitter"
                        >
                            <Twitter className="w-4 h-4 text-text-sub-light hover:text-primary transition-colors" />
                        </button>
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="p-2.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer hover:scale-110"
                            aria-label="Share on LinkedIn"
                        >
                            <Linkedin className="w-4 h-4 text-text-sub-light hover:text-primary transition-colors" />
                        </button>
                        <button
                            onClick={() => handleShare('copy')}
                            className="p-2.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer hover:scale-110 relative"
                            aria-label="Copy link"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-secondary" />
                            ) : (
                                <Link2 className="w-4 h-4 text-text-sub-light hover:text-primary transition-colors" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                    {renderContent(post.content)}
                </div>

                {/* End of article decoration */}
                <div className="flex items-center justify-center my-12">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-16 md:py-20 px-4 md:px-20 bg-gradient-to-b from-orange-50/30 to-transparent border-t border-slate-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-black text-text-main-light mb-3">
                                Continue Reading
                            </h2>
                            <p className="text-text-sub-light text-lg">More articles you might enjoy</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {relatedPosts.map(relatedPost => (
                                <BlogCard key={relatedPost.slug} post={relatedPost} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
