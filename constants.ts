import { Destination } from './types';

export const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    shortDescription: 'World\'s safest major city with exceptional transit and theme parks.',
    description: 'Ranked the world\'s safest city in 2024 by World Population Review, and 6th safest for families by Berkshire Hathaway. Home to Tokyo Disneyland, DisneySea, and teamLab digital art museums. The metro system arrives every few minutes with exceptional punctuality. Crime index of just 20.8/100 despite 37 million metro residents.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    tags: ['Urban', 'Safe', 'Theme Parks', 'Clean'],
    metrics: {
      accessibility: 8,
      nature: 6,
      playgrounds: 9,
      healthyFood: 9,
      safety: 10,
      walkability: 9,
      strollerFriendly: 7,
      kidActivities: 10,
      weatherComfort: 7,
      costAffordability: 5
    }
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    shortDescription: 'Record-breaking cycling infrastructure with Tivoli Gardens.',
    description: 'In 2025, approved DKK 600 million for cycling infrastructure - the city\'s largest ever. Famous for Christiania cargo bikes with front compartments for children. Home to Tivoli Gardens (opened 1843) and the Children\'s Traffic Playground in Fælledparken where kids learn road safety. Kids under 12 ride public transit free.',
    image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80',
    tags: ['Walkable', 'Historic', 'Cycling', 'Hygge'],
    metrics: {
      accessibility: 9,
      nature: 8,
      playgrounds: 10,
      healthyFood: 8,
      safety: 9,
      walkability: 10,
      strollerFriendly: 10,
      kidActivities: 9,
      weatherComfort: 6,
      costAffordability: 4
    }
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    shortDescription: 'Asia\'s safest destination with Gardens by the Bay.',
    description: 'Ranked safest country in Asia for 2025 and 6th globally by Global Peace Index. Features Gardens by the Bay with iconic Supertrees, Singapore Zoo with open-concept design, and Universal Studios on Sentosa Island. The MRT is clean, reliable, and safe at all hours. Welcomed nearly 17 million visitors in 2024.',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    tags: ['Modern', 'Tropical', 'Clean', 'Gardens'],
    metrics: {
      accessibility: 10,
      nature: 9,
      playgrounds: 9,
      healthyFood: 8,
      safety: 10,
      walkability: 8,
      strollerFriendly: 10,
      kidActivities: 10,
      weatherComfort: 8,
      costAffordability: 5
    }
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    shortDescription: '400-hectare Stanley Park rainforest meets mountain scenery.',
    description: 'Level 1 travel advisory (safest level). Stanley Park spans 400 hectares of rainforest with Vancouver Aquarium, seawall walking paths, splash parks, and beachfront hideaways. West End neighborhood has 20% below average crime rates. Granville Island features kids market and water park. Science World offers hands-on exhibits.',
    image: 'https://images.unsplash.com/photo-1559511260-66a68e7e7e29?w=800&q=80',
    tags: ['Nature', 'Active', 'Coastal', 'Mountains'],
    metrics: {
      accessibility: 8,
      nature: 10,
      playgrounds: 8,
      healthyFood: 9,
      safety: 8,
      walkability: 9,
      strollerFriendly: 8,
      kidActivities: 8,
      weatherComfort: 7,
      costAffordability: 6
    }
  },
  {
    id: 'gold-coast',
    name: 'Gold Coast',
    country: 'Australia',
    shortDescription: 'Australia\'s largest theme park collection with patrolled beaches.',
    description: 'Home to Dreamworld (Australia\'s largest with 40+ rides including new Jungle Rush coaster Dec 2024), Movie World (new Wizard of Oz precinct Dec 2024), Sea World, and Wet\'n\'Wild with Australia\'s tallest water slide. 800km of cycling paths and the largest professional lifeguard service in Australia. Currumbin Wildlife Sanctuary for koala encounters.',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    tags: ['Beach', 'Sunny', 'Wildlife', 'Theme Parks'],
    metrics: {
      accessibility: 8,
      nature: 9,
      playgrounds: 9,
      healthyFood: 7,
      safety: 9,
      walkability: 7,
      strollerFriendly: 8,
      kidActivities: 10,
      weatherComfort: 9,
      costAffordability: 7
    }
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    shortDescription: 'NEMO Science Museum and Europe\'s biggest playground nearby.',
    description: 'NEMO Science Museum spans 5 floors of hands-on exhibits in an iconic ship-shaped building with rooftop water play. Artis Royal Zoo is the oldest in the Netherlands with aquarium and planetarium. Linnaeushof near Amsterdam is Europe\'s biggest playground with 350+ attractions. TunFun offers indoor play in a converted traffic underpass. Vondelpark has hidden playgrounds throughout.',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
    tags: ['Cultural', 'Cycling', 'Museums', 'Canals'],
    metrics: {
      accessibility: 8,
      nature: 7,
      playgrounds: 9,
      healthyFood: 8,
      safety: 8,
      walkability: 9,
      strollerFriendly: 7,
      kidActivities: 9,
      weatherComfort: 6,
      costAffordability: 6
    }
  }
];
