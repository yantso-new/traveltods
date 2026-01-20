import React from 'react';
import { Destination, DestinationMetrics } from '@/types';
import { Card } from '@/components/ui';

interface Props {
  destination: Destination;
  onClick: () => void;
}

export const DestinationCard: React.FC<Props> = ({ destination, onClick }) => {
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
  const colors = ["bg-blue-100/90 text-blue-700", "bg-pink-100/90 text-pink-700", "bg-green-100/90 text-green-700", "bg-purple-100/90 text-purple-700", "bg-orange-100/90 text-orange-700", "bg-teal-100/90 text-teal-700"];
  const colorClass = colors[bestTag.length % colors.length];

  return (
    <Card
      onClick={onClick}
      noHoverLift={true}
      className="group flex flex-col overflow-hidden h-full md:h-[22rem] border-2 border-transparent"
    >
      <div className="relative h-48 md:h-[11rem] overflow-hidden">
        <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm ${colorClass}`}>
          {bestTag}
        </div>
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${destination.image || '/placeholder.jpg'}")` }}
        >
        </div>
      </div>

      <div className="flex flex-col p-6 gap-4 bg-surface-light">
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

        <p className="text-text-sub-light leading-relaxed line-clamp-2">
          {destination.shortDescription}
        </p>
      </div>
    </Card>
  );
};