import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-light border-t border-[var(--border)] pt-12 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-surface-light rounded-xl flex items-center justify-center overflow-hidden border border-[var(--border)]">
              <img src="/logo.png" alt="TravelTods Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-extrabold text-text-main-light tracking-tight">TravelTods</span>
          </div>

          {/* Minimal Nav */}
          <nav className="flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <Link href="/blog" className="text-sm font-medium text-text-sub-light hover:text-primary transition-colors duration-200">
              Blog
            </Link>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-sub-light text-xs font-light">
            © 2026 TravelTods. Built with <Heart className="w-3 h-3 inline text-primary fill-primary" /> for families.
          </p>
        </div>
      </div>
    </footer>
  );
};
