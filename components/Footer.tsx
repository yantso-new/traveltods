import React from 'react';
import { Globe, Heart, Instagram, Twitter, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-stone-100 shadow-sm">
                <img src="/logo.png" alt="TravelTods Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-stone-800 tracking-tight">TravelTods</span>
            </div>
            <p className="text-stone-500 text-sm font-light leading-relaxed">
              Making family travel stress-free with data-driven compatibility metrics and AI-powered local insights.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-stone-800 font-bold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3 text-stone-500 text-sm font-light">
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Top Destinations</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Nature Getaways</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Beach Holidays</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">City Adventures</li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-stone-800 font-bold mb-4 text-sm uppercase tracking-wider">Community</h4>
            <ul className="space-y-3 text-stone-500 text-sm font-light">
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Parent Guides</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Travel Forum</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Safety Tips</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Local Meetups</li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-stone-800 font-bold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-stone-500 text-sm font-light">
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-rose-400 cursor-pointer transition-colors">Contact Us</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-400 text-xs font-light">
            © 2026 TravelTods. All rights reserved. Built with <Heart className="w-3 h-3 inline text-rose-400 fill-rose-400" /> for families.
          </p>
          <div className="flex items-center gap-6">
            <Instagram className="w-5 h-5 text-stone-400 hover:text-rose-400 cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-stone-400 hover:text-rose-400 cursor-pointer transition-colors" />
            <Github className="w-5 h-5 text-stone-400 hover:text-rose-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};