import React, { useState, useEffect } from 'react';
import { Destination, DestinationMetrics } from '@/types';
import { Card } from '@/components/ui';
import { Heart } from 'lucide-react';

interface Props {
  destination: Destination;
  onClick: () => void;
}

export const DestinationCard: React.FC<Props> = ({ destination, onClick }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`saved_${destination.id}`);
    if (saved === 'true') setIsSaved(true);
  }, [destination.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isSaved;
    setIsSaved(newState);
    localStorage.setItem(`saved_${destination.id}`, String(newState));
  };

  // Use familyScore if available, otherwise calculate from metrics
  let displayScore: string;

  if (destination.familyScore != null) {
    displayScore = (destination.familyScore / 10).toFixed(1);
  } else {
    const metrics: number[] = Object.values(destination.metrics);
    const scoreNum = metrics.reduce((a: number, b: number) => a + b, 0) / metrics.length;
    displayScore = scoreNum.toFixed(1);
  }

  // Calculate best tag
  const getBestTag = (metrics: DestinationMetrics) => {
    const getValue = (key: keyof DestinationMetrics) => metrics[key] || 0;

    const tagDefinitions = [
      { label: "Safe & Playful", check: () => getValue('safety') >= 8 && getValue('playgrounds') >= 8, score: () => getValue('safety') + getValue('playgrounds') },
      { label: "Walkable & Sunny", check: () => getValue('walkability') >= 8 && getValue('weatherComfort') >= 8, score: () => getValue('walkability') + getValue('weatherComfort') },
      { label: "Accessible Adventure", check: () => getValue('accessibility') >= 8 && getValue('kidActivities') >= 8, score: () => getValue('accessibility') + getValue('kidActivities') },
      { label: "Healthy & Active", check: () => getValue('healthyFood') >= 8 && getValue('walkability') >= 8, score: () => getValue('healthyFood') + getValue('walkability') },
      { label: "Stroller Paradise", check: () => getValue('strollerFriendly') >= 8 && getValue('sidewalks') >= 8, score: () => getValue('strollerFriendly') + getValue('sidewalks') },
      { label: "Budget Friendly Fun", check: () => getValue('costAffordability') >= 8 && getValue('kidActivities') >= 8, score: () => getValue('costAffordability') + getValue('kidActivities') },
      { label: "Safe & Easy", check: () => getValue('safety') >= 8 && getValue('walkability') >= 8, score: () => getValue('safety') + getValue('walkability') },
      { label: "Play & Eat", check: () => getValue('playgrounds') >= 8 && getValue('healthyFood') >= 8, score: () => getValue('playgrounds') + getValue('healthyFood') },
      { label: "Sunny & Safe", check: () => getValue('weatherComfort') >= 8 && getValue('safety') >= 8, score: () => getValue('weatherComfort') + getValue('safety') },
      { label: "Total Package", check: () => getValue('safety') >= 8.5 && getValue('walkability') >= 8.5 && getValue('playgrounds') >= 8.5, score: () => getValue('safety') + getValue('walkability') + getValue('playgrounds') + 2 }
    ];

    const matches = tagDefinitions.filter(def => def.check()).map(def => ({ ...def, finalScore: def.score() })).sort((a, b) => b.finalScore - a.finalScore);
    if (matches.length > 0) return matches[0].label;

    const metricLabels: Record<string, string> = {
      safety: "Safe Area", playgrounds: "Playgrounds", kidActivities: "Activities", weatherComfort: "Weather",
      costAffordability: "Affordable", walkability: "Walkable", strollerFriendly: "Stroller", accessibility: "Accessible", healthyFood: "Healthy Food"
    };
    const bestSingle = Object.entries(metrics).filter(([key]) => key !== 'nature' && metricLabels[key]).sort((a, b) => b[1] - a[1])[0];
    return bestSingle ? metricLabels[bestSingle[0]] : "Family Friendly";
  };

  const bestTag = getBestTag(destination.metrics);

  // Solid, high-contrast pill colors with better visibility
  const pillVariants = [
    "bg-primary text-white shadow-lg shadow-primary/30",
    "bg-secondary text-white shadow-lg shadow-secondary/30",
    "bg-accent text-accent-foreground shadow-lg shadow-accent/40",
    "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/40",
    "bg-gradient-to-r from-secondary to-teal-500 text-white shadow-lg shadow-secondary/40",
    "bg-gradient-to-r from-amber-400 to-accent text-accent-foreground shadow-lg shadow-accent/50"
  ];
  const pillClass = pillVariants[bestTag.length % pillVariants.length];

  return (
    <Card
      onClick={onClick}
      noHoverLift={true}
      className="group flex flex-col overflow-hidden h-full md:h-[22rem] border-2 border-transparent transition-all duration-300"
    >
      <div className="relative h-48 md:h-[11rem] overflow-hidden">
        <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-extrabold backdrop-blur-md border border-white/20 ${pillClass}`}>
          {bestTag}
        </div>

        {/* Save Toggle */}
        <button
          onClick={toggleSave}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 ${isSaved ? 'bg-primary border-primary' : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : ''}`} />
        </button>

        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url("${destination.image || '/placeholder.jpg'}")` }}
        >
        </div>
      </div>

      <div className="flex flex-col p-6 gap-4 bg-surface-light border-t border-slate-50 flex-grow">
        <div>
          <div className="flex justify-between items-start w-full">
            <h3 className="text-xl font-bold text-text-main-light group-hover:text-primary transition-colors capitalize">
              {destination.name.split(',')[0].trim()}
            </h3>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-accent text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-text-main-light font-bold text-sm">{displayScore}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-text-sub-light mt-1">
            <span className="text-sm font-medium">{destination.country}</span>
          </div>
        </div>

        <p className="text-text-sub-light text-sm leading-relaxed line-clamp-2">
          {destination.shortDescription}
        </p>
      </div>
    </Card>
  );
};