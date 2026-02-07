import React from 'react';
import Link from 'next/link';
import { Globe, Heart, Instagram, Twitter, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-light border-t border-[var(--border)] pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-surface-light rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                <img src="/logo.png" alt="TravelTods Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold text-text-main-light tracking-tight">TravelTods</span>
            </div>
            <p className="text-text-sub-light text-sm font-light leading-relaxed">
              Making family travel stress-free with data-driven compatibility metrics and AI-powered local insights.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-text-main-light font-bold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3 text-text-sub-light text-sm font-light">
              <li><Link href="/blog/top-destinations-2026" className="hover:text-primary transition-colors duration-200">Top Destinations</Link></li>
              <li><Link href="/blog/nature-getaways-with-kids" className="hover:text-primary transition-colors duration-200">Nature Getaways</Link></li>
              <li><Link href="/blog/beach-holidays-guide" className="hover:text-primary transition-colors duration-200">Beach Holidays</Link></li>
              <li><Link href="/blog/city-adventures-toddlers" className="hover:text-primary transition-colors duration-200">City Adventures</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-text-main-light font-bold mb-4 text-sm uppercase tracking-wider">Community</h4>
            <ul className="space-y-3 text-text-sub-light text-sm font-light">
              <li><Link href="/blog/parent-guide-first-flight" className="hover:text-primary transition-colors duration-200">Parent Guides</Link></li>
              <li><Link href="/blog/travel-forum-highlights" className="hover:text-primary transition-colors duration-200">Travel Forum</Link></li>
              <li><Link href="/blog/safety-tips-abroad" className="hover:text-primary transition-colors duration-200">Safety Tips</Link></li>
              <li><Link href="/blog/local-meetups-families" className="hover:text-primary transition-colors duration-200">Local Meetups</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-text-main-light font-bold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-text-sub-light text-sm font-light">
              <li className="hover:text-primary cursor-pointer transition-colors duration-200">Help Center</li>
              <li className="hover:text-primary cursor-pointer transition-colors duration-200">Privacy Policy</li>
              <li className="hover:text-primary cursor-pointer transition-colors duration-200">Terms of Service</li>
              <li className="hover:text-primary cursor-pointer transition-colors duration-200">Contact Us</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-sub-light text-xs font-light">
            © 2026 TravelTods. All rights reserved. Built with <Heart className="w-3 h-3 inline text-primary fill-primary" /> for families.
          </p>
          <div className="flex items-center gap-6">
            <Instagram className="w-5 h-5 text-text-sub-light hover:text-primary cursor-pointer transition-colors duration-200" />
            <Twitter className="w-5 h-5 text-text-sub-light hover:text-primary cursor-pointer transition-colors duration-200" />
            <Github className="w-5 h-5 text-text-sub-light hover:text-primary cursor-pointer transition-colors duration-200" />
          </div>
        </div>
      </div>
    </footer>
  );
};