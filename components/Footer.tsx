import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-light border-t border-[var(--border)] pt-12 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8 mb-10 md:grid-cols-[1fr_auto_auto]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-surface-light rounded-xl flex items-center justify-center overflow-hidden border border-[var(--border)]">
              <img src="/logo.png" alt="TravelTods Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-extrabold text-text-main-light tracking-tight">TravelTods</span>
          </div>

          <nav aria-label="Explore" className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-text-main-light">Explore</p>
            <Link href="/" className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <Link href="/blog" className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors duration-200">
              Blog
            </Link>
          </nav>
          <nav aria-label="Trust and policies" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Link href="/about" className="font-medium text-text-sub-light hover:text-primary">About</Link>
            <Link href="/methodology" className="font-medium text-text-sub-light hover:text-primary">Methodology</Link>
            <Link href="/editorial-policy" className="font-medium text-text-sub-light hover:text-primary">Editorial policy</Link>
            <Link href="/affiliate-disclosure" className="font-medium text-text-sub-light hover:text-primary">Affiliate disclosure</Link>
            <Link href="/privacy" className="font-medium text-text-sub-light hover:text-primary">Privacy</Link>
            <Link href="/terms" className="font-medium text-text-sub-light hover:text-primary">Terms</Link>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-sub-light text-xs font-light">
            © 2026 TravelTods. Built with <Heart className="w-3 h-3 inline text-primary fill-primary" /> for families.
          </p>
          <a href="mailto:yanivtsoref@gmail.com" className="text-xs font-bold text-primary hover:underline">
            yanivtsoref@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};
