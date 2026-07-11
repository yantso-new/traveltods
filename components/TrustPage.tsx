import type { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export function TrustPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-light text-text-main-light">
      <Navbar />
      <main className="px-4 py-12 md:px-20 md:py-20">
        <article className="mx-auto max-w-4xl">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-sub-light md:text-xl">{intro}</p>
          <div className="mt-10 space-y-8 rounded-3xl border border-[var(--border)] bg-surface-light p-6 leading-relaxed md:p-10 [&_a]:font-bold [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-tight [&_h3]:text-lg [&_h3]:font-black [&_li]:text-text-sub-light [&_p]:text-text-sub-light [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            {children}
          </div>
          <nav aria-label="Trust and policy pages" className="mt-8 flex flex-wrap gap-3 text-sm">
            <TrustLink href="/about">About</TrustLink>
            <TrustLink href="/methodology">Methodology</TrustLink>
            <TrustLink href="/editorial-policy">Editorial policy</TrustLink>
            <TrustLink href="/affiliate-disclosure">Affiliate disclosure</TrustLink>
            <TrustLink href="/privacy">Privacy</TrustLink>
            <TrustLink href="/terms">Terms</TrustLink>
          </nav>
        </article>
      </main>
    </div>
  );
}

function TrustLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="rounded-full border border-[var(--border)] bg-surface-light px-4 py-2 font-bold text-text-main-light transition-colors hover:border-primary/40 hover:text-primary">
      {children}
    </Link>
  );
}
