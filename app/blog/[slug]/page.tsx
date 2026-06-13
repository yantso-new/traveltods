'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Twitter, Linkedin, Link2, Check, ExternalLink, MapPin } from 'lucide-react';
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

    const formattedDate = new Date(post.lastUpdated).toLocaleDateString('en-US', {
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

    // Lightweight markdown-like rendering for trusted local blog content.
    const renderContent = (content: string) => {
        const lines = content.trim().split('\n');
        const elements: React.ReactNode[] = [];
        let inBlockquote = false;
        let blockquoteContent: string[] = [];
        let listItems: string[] = [];

        const linkify = (text: string) => {
            const parts: React.ReactNode[] = [];
            const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
            let lastIndex = 0;
            let match: RegExpExecArray | null;

            while ((match = linkRegex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(text.slice(lastIndex, match.index));
                }

                parts.push(
                    <a
                        key={`${match[1]}-${match.index}`}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
                    >
                        {match[1]}
                    </a>
                );
                lastIndex = match.index + match[0].length;
            }

            if (lastIndex < text.length) {
                parts.push(text.slice(lastIndex));
            }

            return parts.length ? parts : text;
        };

        const flushList = (index: number) => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${index}`} className="space-y-2 my-6 ml-4">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-text-main-light leading-relaxed">
                                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                                <span>{linkify(item)}</span>
                            </li>
                        ))}
                    </ul>
                );
                listItems = [];
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
                            <p key={i} className="text-text-sub-light italic text-base leading-relaxed">{linkify(bqLine)}</p>
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
                    <h2 key={index} className="text-2xl md:text-3xl font-bold text-text-main-light mt-10 mb-5 border-b border-[var(--border)] pb-3">
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
                        {linkify(trimmedLine)}
                    </p>
                );
            }
        });

        // Handle trailing blockquote or list
        if (inBlockquote && blockquoteContent.length > 0) {
            elements.push(
                <blockquote key="bq-final" className="border-l-4 border-secondary pl-6 py-4 my-6 bg-secondary/5 rounded-r-xl">
                    {blockquoteContent.map((bqLine, i) => (
                        <p key={i} className="text-text-sub-light italic text-base leading-relaxed">{linkify(bqLine)}</p>
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
                    src={post.image.url}
                    alt={post.image.alt}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Floating badge on hero */}
                <div className="absolute bottom-8 left-4 md:left-20">
                    <div className="flex flex-col gap-2">
                        <Badge
                            variant={post.category === 'destinations' ? 'solid-primary' : 'solid-secondary'}
                            className="capitalize text-sm font-bold w-fit"
                        >
                            {post.category}
                        </Badge>
                        <a
                            href={post.image.creditUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/80 hover:text-white underline underline-offset-4"
                        >
                            Image: {post.image.creditLabel}
                        </a>
                    </div>
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
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-10 pb-8 border-b-2 border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-main-light">{post.destinationName || 'Family travel tips'}</p>
                            <p className="text-xs text-text-sub-light">
                                {post.destinationId ? `Destination ID ${post.destinationId}` : 'No fictional byline'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-text-sub-light">
                        <Calendar className="w-4 h-4" />
                        <span>Updated {formattedDate}</span>
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
                            className="p-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer active:scale-[0.985]"
                            aria-label="Share on Twitter"
                        >
                            <Twitter className="w-4 h-4 text-text-sub-light hover:text-primary transition-colors" />
                        </button>
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="p-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer active:scale-[0.985]"
                            aria-label="Share on LinkedIn"
                        >
                            <Linkedin className="w-4 h-4 text-text-sub-light hover:text-primary transition-colors" />
                        </button>
                        <button
                            onClick={() => handleShare('copy')}
                            className="p-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer active:scale-[0.985] relative"
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

                {post.places.length > 0 && (
                    <section className="mt-12 border-t border-[var(--border)] pt-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-main-light mb-5">Places mentioned</h2>
                        <div className="grid gap-4">
                            {post.places.map(place => (
                                <div key={place.name} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                                    <h3 className="text-lg font-bold text-text-main-light">{place.name}</h3>
                                    <p className="text-text-sub-light mt-1 mb-4">{place.description}</p>
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={place.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
                                        >
                                            Google Maps
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        {place.officialUrl && (
                                            <a
                                                href={place.officialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline underline-offset-4"
                                            >
                                                Official site
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mt-12 border-t border-[var(--border)] pt-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-main-light mb-5">Sources checked</h2>
                    <ul className="grid gap-3">
                        {post.sources.map(source => (
                            <li key={source.url}>
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4"
                                >
                                    {source.label}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* End of article decoration */}
                <div className="flex items-center justify-center my-12">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        <div className="w-2 h-2 rounded-full bg-accent-strong"></div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-16 md:py-20 px-4 md:px-20 bg-muted/35 border-t border-[var(--border)]">
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
