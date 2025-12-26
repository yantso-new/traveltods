export interface DestinationMetrics {
  accessibility: number; // 0-10
  nature: number;
  playgrounds: number;
  healthyFood: number;
  safety: number;
  walkability: number;
  strollerFriendly: number;
  kidActivities: number;
  weatherComfort: number;     // NEW: 0-10
  costAffordability: number;  // NEW: 0-10
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  shortDescription: string;
  image: string;
  metrics: DestinationMetrics;
  tags: string[];
  familyScore?: number | null;  // NEW: Optional overall score (null if data incomplete)
  hasReliableScore?: boolean;   // NEW: Whether familyScore is reliable
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}