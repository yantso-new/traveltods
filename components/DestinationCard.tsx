import React from 'react';
import { Destination } from '@/types';
import { Card } from '@/components/ui';

interface Props {
  destination: Destination;
  onClick: () => void;
}

export const DestinationCard: React.FC<Props> = ({ destination, onClick }) => {
  // Use familyScore if available, otherwise calculate from metrics
  // Fallback logic kept for robustness
  let displayScore: string;

  if (destination.familyScore != null) {
    displayScore = (destination.familyScore / 10).toFixed(1);
  } else {
    const metrics: number[] = Object.values(destination.metrics);
    const scoreNum = metrics.reduce((a: number, b: number) => a + b, 0) / metrics.length;
    displayScore = scoreNum.toFixed(1);
  }

  return (
    <Card
      onClick={onClick}
      noHoverLift={true}
      className="group flex flex-col overflow-hidden h-full border-2 border-transparent"
    >
      <div className="relative h-64 overflow-hidden">
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
          <span className="material-symbols-outlined text-accent text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="text-text-main-light font-bold text-sm">{displayScore}</span>
        </div>
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${destination.image || '/placeholder.jpg'}")` }}
        >
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4 bg-surface-light">
        <div>
          <h3 className="text-xl font-bold text-text-main-light group-hover:text-primary transition-colors capitalize">
            {destination.name.split(',')[0].trim()}
          </h3>
          <div className="flex items-center gap-1 text-text-sub-light mt-1">
            {/* <span className="material-symbols-outlined text-lg">location_on</span> */}
            <span className="text-sm font-medium">{destination.country}</span>
          </div>
        </div>

        <p className="text-text-sub-light leading-relaxed line-clamp-2">
          {destination.shortDescription}
        </p>

        <div className="flex flex-nowrap gap-2 mt-auto pt-2 overflow-hidden mask-linear-fade-right">
          {(() => {
            // Map metrics to display labels
            const metricLabels: Record<string, string> = {
              safety: "Safe Area",
              playgrounds: "Playgrounds",
              kidActivities: "Activities",
              weatherComfort: "Weather",
              costAffordability: "Affordable",
              walkability: "Walkable",
              strollerFriendly: "Stroller",
              accessibility: "Accessible",
              healthyFood: "Healthy Food",
            };

            // Calculate top tags from metrics
            const topTags = Object.entries(destination.metrics)
              .filter(([key, value]) => key !== 'nature' && metricLabels[key] && value > 8.5)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([key]) => metricLabels[key]);

            return topTags.map((tag, i) => {
              const colors = [
                "bg-blue-100 text-blue-700",
                "bg-pink-100 text-pink-700",
                "bg-green-100 text-green-700",
                "bg-purple-100 text-purple-700"
              ];
              const colorClass = colors[i % colors.length];
              return (
                <span key={tag} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${colorClass}`}>
                  {tag}
                </span>
              );
            });
          })()}
        </div>

        {/* <button className="mt-2 w-full py-3 rounded-xl bg-slate-50 hover:bg-primary text-text-main-light hover:text-white font-bold text-sm transition-all duration-300 border border-slate-100 hover:border-primary shadow-sm hover:shadow-lg hover:shadow-primary/30">
          View Details
        </button> */}
      </div>
    </Card>
  );
};