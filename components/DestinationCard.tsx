import React from 'react';
import { Destination } from '@/types';
import { Card, Badge } from '@/components/ui';
import { MapPin, Star } from 'lucide-react';

interface Props {
  destination: Destination;
  onClick: () => void;
}

export const DestinationCard: React.FC<Props> = ({ destination, onClick }) => {
  // Calculate average score
  const metrics: number[] = Object.values(destination.metrics);
  const avgScore = (metrics.reduce((a: number, b: number) => a + b, 0) / metrics.length).toFixed(1);
  const scoreNum = parseFloat(avgScore);

  // Dynamic colors based on rating
  const isHighRated = scoreNum >= 7;
  const textColor = isHighRated ? 'text-violet-600' : 'text-rose-500';
  const fillColor = isHighRated ? 'fill-violet-600' : 'fill-rose-500';
  const bgColor = isHighRated ? 'bg-violet-50' : 'bg-rose-50';

  return (
    <Card onClick={onClick} className="overflow-hidden group flex flex-col h-full hover:border-rose-200 hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3 gap-4">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-stone-800 leading-tight group-hover:text-rose-600 transition-colors">{destination.name}</h3>
            <p className="text-sm text-stone-500 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {destination.country}
            </p>
          </div>
          <div className={`shrink-0 ${bgColor} px-2.5 py-1 rounded-full text-sm font-bold ${textColor} flex items-center shadow-sm transition-colors duration-300 border border-white/50`}>
            <Star className={`w-3 h-3 mr-1 ${fillColor}`} />
            {avgScore}
          </div>
        </div>
        <p className="text-stone-600 text-sm line-clamp-2 mb-4 flex-grow font-light">
          {destination.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {destination.tags.slice(0, 3).map(tag => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};