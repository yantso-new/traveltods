"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface GeoapifyFeature {
  properties: {
    city?: string;
    name?: string;
    country?: string;
    formatted?: string;
    result_type?: string;
    suburb?: string;
    state?: string;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

interface Suggestion {
  city: string;
  country: string;
  formatted: string;
}

interface DestinationAutocompleteProps {
  onSelect: (destination: { name: string; country: string }) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function DestinationAutocomplete({
  onSelect,
  onSearch,
  placeholder = "Search destinations (e.g., 'Kyoto', 'Paris')...",
  className = "",
  variant = 'default',
}: DestinationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasValidSelection, setHasValidSelection] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (!searchText.trim() || searchText.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (!API_KEY) {
      console.warn('Geoapify API key not configured');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&type=city&limit=5&apiKey=${API_KEY}`
      );

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data: GeoapifyResponse = await response.json();

      const formattedSuggestions: Suggestion[] = data.features
        .filter(f => f.properties.country)
        .map(feature => {
          const props = feature.properties;
          // Get the best city name - prefer city, then suburb (for places like Paris), then name
          const cityName = props.city || props.suburb || props.name || '';
          return {
            city: cityName,
            country: props.country || '',
            formatted: props.formatted || '',
          };
        })
        .filter(s => s.city)
        // Remove duplicates (same city + country)
        .filter((s, i, arr) => arr.findIndex(x => x.city === s.city && x.country === s.country) === i);

      setSuggestions(formattedSuggestions);
      setIsOpen(formattedSuggestions.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_KEY]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    const destinationName = `${suggestion.city}, ${suggestion.country}`;
    setQuery(destinationName);
    setIsOpen(false);
    setHasValidSelection(true);
    onSelect({ name: suggestion.city, country: suggestion.country });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Enter') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        } else if (query.trim()) {
          // Allow search even if not selected from list (free text) regarding user intent
          onSearch(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query);
    }
  };

  const isMinimal = variant === 'minimal';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className={
            isMinimal
              ? "w-full pl-10 pr-10 py-2.5 rounded-full border border-slate-200 bg-surface-light/80 focus:bg-surface-light focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm text-sm transition-all duration-200 placeholder:text-text-sub-light text-text-main-light font-medium"
              : "w-full pl-12 pr-32 py-4 rounded-full border border-slate-200 bg-white/95 backdrop-blur focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none shadow-xl shadow-black/10 text-lg transition-all placeholder:text-text-sub-light text-text-main-light font-medium"
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasValidSelection(false);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        />

        <Search
          className={
            isMinimal
              ? "absolute left-3.5 top-1/2 -translate-y-1/2 text-primary w-4 h-4"
              : "absolute left-5 top-1/2 -translate-y-1/2 text-text-sub-light w-5 h-5 group-hover:text-primary transition-colors duration-200"
          }
        />

        {isLoading && (
          <Loader2
            className={
              isMinimal
                ? "absolute right-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 animate-spin"
                : "absolute right-28 top-1/2 -translate-y-1/2 text-primary w-5 h-5 animate-spin"
            }
          />
        )}

        {/* Only show the big search button in default (hero) mode */}
        {!isMinimal && (
          <button
            onClick={handleSearchClick}
            disabled={!hasValidSelection && !query.trim()}
            className={`absolute right-2 top-2 bottom-2 rounded-full px-6 flex items-center gap-2 transition-all duration-200 font-bold text-sm ${(hasValidSelection || query.trim())
              ? 'bg-primary hover:bg-primary-dark text-primary-foreground cursor-pointer shadow-md active:scale-[0.98]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.city}-${suggestion.country}-${index}`}
                  className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-200 ${index === highlightedIndex
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                    }`}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${index === highlightedIndex ? 'text-primary' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-text-main-light">
                      {suggestion.city}
                    </span>
                    <span className="text-text-sub-light ml-1 font-medium">
                      {suggestion.country}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-text-sub-light text-center">
              No places found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
