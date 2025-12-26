import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Baby, 
  Trees, 
  Utensils, 
  ShieldCheck, 
  Footprints, 
  Smile, 
  Accessibility,
  Send,
  MapPin,
  Bot
} from 'lucide-react';
import { Destination, ChatMessage } from '../types';
import { MOCK_DESTINATIONS } from '../constants';
import { Button, Badge, ProgressBar, Card, LoadingSpinner } from '../components/ui';
import { askTravelGuide } from '../services/geminiService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';

export const DestinationDetails: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    if (location.state?.destination) {
      setDestination(location.state.destination);
    } else {
      const found = MOCK_DESTINATIONS.find(d => d.id === id);
      if (found) setDestination(found);
    }
  }, [id, location.state]);

  if (!destination) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsChatting(true);

    const answer = await askTravelGuide(destination.name, chatInput);
    
    setChatMessages(prev => [...prev, { role: 'model', text: answer }]);
    setIsChatting(false);
  };

  const chartData = [
    { subject: 'Safety', A: destination.metrics.safety, fullMark: 10 },
    { subject: 'Food', A: destination.metrics.healthyFood, fullMark: 10 },
    { subject: 'Play', A: destination.metrics.playgrounds, fullMark: 10 },
    { subject: 'Nature', A: destination.metrics.nature, fullMark: 10 },
    { subject: 'Stroller', A: destination.metrics.strollerFriendly, fullMark: 10 },
    { subject: 'Access', A: destination.metrics.accessibility, fullMark: 10 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent" />
        <div className="absolute top-6 left-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md rounded-full px-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
        </div>
        <div className="absolute bottom-8 left-6 md:left-12 max-w-4xl">
          <Badge className="bg-rose-500/90 text-white border-none mb-4 shadow-sm text-sm px-3 py-1">{destination.country}</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 shadow-sm">{destination.name}</h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl shadow-sm font-light">{destination.shortDescription}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <Card className="p-8 shadow-md">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">About this destination</h2>
            <p className="text-stone-600 leading-relaxed text-lg mb-6 font-light">
              {destination.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {destination.tags.map(tag => (
                <Badge key={tag} className="text-sm py-1.5 px-3 bg-stone-100 text-stone-600 border-stone-200">{tag}</Badge>
              ))}
            </div>
          </Card>

          {/* Detailed Metrics Breakdown */}
          <Card className="p-8 shadow-md">
            <h3 className="text-xl font-bold text-stone-800 mb-6">Family Compatibility Score</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <ProgressBar 
                value={destination.metrics.safety} 
                label="Safety & Crime" 
                icon={<ShieldCheck className="w-4 h-4" />} 
                color="bg-emerald-300"
              />
              <ProgressBar 
                value={destination.metrics.healthyFood} 
                label="Healthy Food Options" 
                icon={<Utensils className="w-4 h-4" />} 
                color="bg-orange-300"
              />
              <ProgressBar 
                value={destination.metrics.playgrounds} 
                label="Playgrounds & Parks" 
                icon={<Trees className="w-4 h-4" />} 
                color="bg-green-300"
              />
              <ProgressBar 
                value={destination.metrics.strollerFriendly} 
                label="Stroller Friendly" 
                icon={<Baby className="w-4 h-4" />} 
                color="bg-sky-300"
              />
              <ProgressBar 
                value={destination.metrics.walkability} 
                label="Sidewalk Quality" 
                icon={<Footprints className="w-4 h-4" />} 
                color="bg-slate-300"
              />
              <ProgressBar 
                value={destination.metrics.accessibility} 
                label="General Accessibility" 
                icon={<Accessibility className="w-4 h-4" />} 
                color="bg-purple-300"
              />
               <ProgressBar 
                value={destination.metrics.kidActivities} 
                label="Kid Activities" 
                icon={<Smile className="w-4 h-4" />} 
                color="bg-yellow-300"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Visualization & AI Chat */}
        <div className="space-y-8">
          
          {/* Radar Chart */}
          <Card className="p-6 flex flex-col items-center justify-center bg-white shadow-md">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 self-start">Visual Breakdown</h3>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#f5f5f4" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 11 }} />
                  <Radar
                    name={destination.name}
                    dataKey="A"
                    stroke="#fb7185" // Rose 400
                    fill="#fda4af" // Rose 300
                    fillOpacity={0.4}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI Travel Guide */}
          <Card className="p-0 overflow-hidden flex flex-col h-[500px] shadow-md border-rose-100">
            <div className="p-4 bg-gradient-to-r from-rose-400 to-rose-300 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">Local Travel Guide</span>
              </div>
              <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">AI Powered</Badge>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-stone-400 mt-10 text-sm p-4">
                  <p>Ask anything! e.g.</p>
                  <p className="italic mt-2">"Where can I buy diapers?"</p>
                  <p className="italic">"Is the tap water safe?"</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                    ? 'bg-rose-400 text-white rounded-br-none shadow-sm' 
                    : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                   <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                     <LoadingSpinner />
                   </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-stone-100">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask a question..."
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 outline-none text-sm transition-all text-stone-600"
                />
                <button 
                  onClick={handleChat}
                  disabled={!chatInput.trim() || isChatting}
                  className="absolute right-2 top-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};