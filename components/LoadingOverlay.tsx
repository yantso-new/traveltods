"use client";

import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  destinationName: string;
}

export function LoadingOverlay({ isVisible, destinationName }: LoadingOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/98 backdrop-blur-md" />

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center gap-8 transition-all duration-500 ${
        show ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
      }`}>
        {/* Animated Baby Icon */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-[-8px] rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Inner circle with icon */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center">
            {/* Baby Icon - Lucide Baby */}
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/>
              <path d="M15 12h.01"/>
              <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>
              <path d="M9 12h.01"/>
            </svg>
          </div>

          {/* Floating decorative circles */}
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-secondary/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '3s' }} />
          <div className="absolute -bottom-2 -left-4 w-4 h-4 bg-accent/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
          <div className="absolute top-1/2 -right-6 w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-text-main-light tracking-tight">
              Gathering data
            </h3>
            <p className="text-lg text-text-sub-light leading-relaxed">
              Analyzing family-friendly spots in{' '}
              <span className="font-semibold text-primary">{destinationName}</span>
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
            <span className="text-sm text-text-sub-light/80 font-medium">
              Parks, cafés, restaurants...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
