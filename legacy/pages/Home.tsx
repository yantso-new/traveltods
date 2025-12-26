import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Destination } from '../types';
import { MOCK_DESTINATIONS } from '../constants';
import { DestinationCard } from '../components/DestinationCard';
import { Button, Badge } from '../components/ui';
import { generateDestinationData } from '../services/geminiService';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>(MOCK_DESTINATIONS);

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!searchTerm) return;
    setIsGenerating(true);
    const newDest = await generateDestinationData(searchTerm);
    setIsGenerating(false);
    
    if (newDest) {
      setDestinations(prev => [newDest, ...prev]);
      navigate(`/destination/${newDest.id}`, { state: { destination: newDest } });
    } else {
      alert("We couldn't find enough data for that place to build a kid-friendly report. Try a major city or region!");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-rose-50 via-sky-50 to-stone-50 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="bg-white/60 text-rose-500 border-rose-100 text-sm px-4 py-1.5 mb-6 shadow-sm backdrop-blur-sm">
             Top Rated for Families
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-stone-800 tracking-tight leading-tight">
            Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">family adventure</span>.
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
            Discover destinations rated by kid-compatibility. From stroller accessibility to playground density, we've got the metrics that matter to parents.
          </p>
          
          <div className="relative max-w-xl mx-auto mt-10">
            <input
              type="text"
              placeholder="Search destinations (e.g., 'Kyoto', 'Paris')..."
              className="w-full pl-12 pr-4 py-4 rounded-full border border-stone-200 bg-white/80 backdrop-blur focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none shadow-sm text-lg transition-all placeholder:text-stone-300 text-stone-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && filteredDestinations.length === 0 ? handleGenerate() : null}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            {filteredDestinations.length === 0 && searchTerm.length > 2 && (
               <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="absolute right-2 top-2 bottom-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full px-5 flex items-center gap-2"
               >
                 {isGenerating ? 'Analyzing...' : <><Sparkles className="w-4 h-4" /> Analyze AI Report</>}
               </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-stone-800">Popular Destinations</h2>
          <div className="hidden md:flex gap-2">
            <Badge className="cursor-pointer hover:bg-emerald-100 bg-emerald-50 text-emerald-700 border-emerald-100">Nature</Badge>
            <Badge className="cursor-pointer hover:bg-sky-100 bg-sky-50 text-sky-700 border-sky-100">City</Badge>
            <Badge className="cursor-pointer hover:bg-amber-100 bg-amber-50 text-amber-700 border-amber-100">Beach</Badge>
          </div>
        </div>

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map(dest => (
              <DestinationCard 
                key={dest.id} 
                destination={dest} 
                onClick={() => navigate(`/destination/${dest.id}`, { state: { destination: dest } })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-stone-300">
            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700">No destinations found</h3>
            <p className="text-stone-400 mt-2">
              Try clicking "Analyze AI Report" to generate a custom guide for "{searchTerm}".
            </p>
          </div>
        )}
      </main>
    </div>
  );
};