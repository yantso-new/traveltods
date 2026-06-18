import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/blogData";
import { absoluteUrl } from "@/site";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  jsonLd,
  SITE_AUTHOR,
  truncateDescription,
} from "@/seo";
import BlogPostPageClient from "./BlogPostPageClient";

interface BlogPostRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.title,
    description: truncateDescription(post.excerpt),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    authors: [{ name: SITE_AUTHOR }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.lastUpdated,
      modifiedTime: post.lastUpdated,
      authors: [SITE_AUTHOR],
      images: [
        {
          url: post.image.url,
          width: 1200,
          height: 630,
          alt: post.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image.url],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([blogPostingJsonLd(post), breadcrumb]),
        }}
      />
      {post.destinationName && (
        <link
          rel="author"
          href={absoluteUrl(`/blog/${post.slug}`)}
        />
      )}
      <BlogPostPageClient slug={slug} />
    </>
  );
}
