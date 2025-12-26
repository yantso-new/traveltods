import { mutation } from "./_generated/server";
import { calculateAllScores, getRadarChartData, ScoreInputs } from "./lib/scores";

// Real data for European cities based on 2024-2025 research
const cities = [
    {
        name: "London",
        country: "United Kingdom",
        lat: 51.5074,
        lon: -0.1278,
        shortDescription: "World-class museums with free admission and royal parks.",
        description: "Home to free world-class museums including Natural History Museum, Science Museum, and V&A Museum of Childhood. Hyde Park features a pirate-themed playground. Safe central areas with excellent public transport. One of Europe's cities with most green spaces and parks.",
        tags: ["Museums", "Parks", "Historic", "Urban"],
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
        scores: { safety: 72, playgrounds: 80, sidewalks: 75, kidActivities: 95, healthyFood: 70, strollerFriendly: 70, accessibility: 80 }
    },
    {
        name: "Paris",
        country: "France",
        lat: 48.8566,
        lon: 2.3522,
        shortDescription: "Luxembourg Gardens and enchanting carousels throughout.",
        description: "Luxembourg Gardens features France's oldest puppet theatre, vintage merry-go-round, pony rides, model boats, and sandpits. One of Europe's cities with most green spaces. Disneyland Paris nearby. Classic carousels and crepe stands throughout the city.",
        tags: ["Gardens", "Culture", "Historic", "Cuisine"],
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
        scores: { safety: 65, playgrounds: 85, sidewalks: 80, kidActivities: 90, healthyFood: 85, strollerFriendly: 65, accessibility: 75 }
    },
    {
        name: "Rome",
        country: "Italy",
        lat: 41.9028,
        lon: 12.4964,
        shortDescription: "Ancient history comes alive with gelato around every corner.",
        description: "One of Europe's cities with most green spaces and parks. Villa Borghese gardens offer bike rentals, rowboats, and playgrounds. Explora Children's Museum provides hands-on exhibits. Cobblestone streets add charm but can challenge strollers.",
        tags: ["Historic", "Culture", "Gelato", "Gardens"],
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
        scores: { safety: 70, playgrounds: 70, sidewalks: 60, kidActivities: 80, healthyFood: 90, strollerFriendly: 50, accessibility: 60 }
    },
    {
        name: "Copenhagen",
        country: "Denmark",
        lat: 55.6761,
        lon: 12.5683,
        shortDescription: "125 themed playgrounds and world-famous Tivoli Gardens.",
        description: "Features 125 creative playgrounds including rooftop and nature-themed designs. Tivoli Gardens is one of world's oldest amusement parks. Children's Traffic Playground teaches road safety. Kids under 12 ride public transit free. DKK 600M cycling budget approved 2025.",
        tags: ["Playgrounds", "Cycling", "Safe", "Hygge"],
        image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
        scores: { safety: 90, playgrounds: 98, sidewalks: 95, kidActivities: 95, healthyFood: 85, strollerFriendly: 95, accessibility: 90 }
    },
    {
        name: "Amsterdam",
        country: "Netherlands",
        lat: 52.3676,
        lon: 4.9041,
        shortDescription: "NEMO Science Museum and canal boat adventures.",
        description: "NEMO Science Museum spans 5 floors of hands-on exhibits. Vondelpark has hidden playgrounds throughout. TunFun offers indoor play in converted traffic underpass. Artis Royal Zoo is the oldest in Netherlands. Netherlands ranked #1 in UNICEF child wellbeing 2025.",
        tags: ["Museums", "Canals", "Cycling", "Safe"],
        image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
        scores: { safety: 85, playgrounds: 88, sidewalks: 90, kidActivities: 92, healthyFood: 80, strollerFriendly: 75, accessibility: 85 }
    },
    {
        name: "Barcelona",
        country: "Spain",
        lat: 41.3851,
        lon: 2.1734,
        shortDescription: "Playgrounds on nearly every street next to cafes.",
        description: "Nearly every street has a park or playground, often next to cafes for parents. CosmoCaixa Science Museum, Barcelona Aquarium, and Park Güell offer immersive family fun. Beach access and Mediterranean climate year-round.",
        tags: ["Beach", "Playgrounds", "Culture", "Sunny"],
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
        scores: { safety: 70, playgrounds: 90, sidewalks: 80, kidActivities: 88, healthyFood: 85, strollerFriendly: 75, accessibility: 75 }
    },
    {
        name: "Vienna",
        country: "Austria",
        lat: 48.2082,
        lon: 16.3738,
        shortDescription: "Best city for expat families with affordable green spaces.",
        description: "Recognized as best place for expats to move with families in 2024. Low crime rate with VCR of 8.1 and PCR of 22.4. Comprehensive CCTV network. Many green areas and children's entertainment. Prater amusement park features giant Ferris wheel and family rides.",
        tags: ["Safe", "Parks", "Culture", "Music"],
        image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80",
        scores: { safety: 92, playgrounds: 85, sidewalks: 90, kidActivities: 85, healthyFood: 80, strollerFriendly: 85, accessibility: 90 }
    },
    {
        name: "Berlin",
        country: "Germany",
        lat: 52.5200,
        lon: 13.4050,
        shortDescription: "Creative playgrounds and child-friendly cafes throughout.",
        description: "One of the best city breaks with kids. Many playgrounds and green areas, lots of attractions, theatres, and child-friendly cafes. Rich history presented in engaging ways. Affordable compared to other Western European capitals.",
        tags: ["Culture", "Playgrounds", "History", "Urban"],
        image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
        scores: { safety: 75, playgrounds: 88, sidewalks: 85, kidActivities: 90, healthyFood: 75, strollerFriendly: 80, accessibility: 85 }
    },
    {
        name: "Prague",
        country: "Czech Republic",
        lat: 50.0755,
        lon: 14.4378,
        shortDescription: "Free kids' transit and Children's Island playground.",
        description: "Called 'the most child friendly city' by travelers. Children travel free on public transport. Children's Island features great playground on river island. Prague Zoo ranked among best in world. Letna Park beer garden has outdoor play area with panoramic views.",
        tags: ["Historic", "Affordable", "Safe", "Fairytale"],
        image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
        scores: { safety: 82, playgrounds: 85, sidewalks: 80, kidActivities: 88, healthyFood: 70, strollerFriendly: 70, accessibility: 75 }
    },
    {
        name: "Lisbon",
        country: "Portugal",
        lat: 38.7223,
        lon: -9.1393,
        shortDescription: "Oceanarium and iconic Tram 28 through historic hills.",
        description: "Lisbon Oceanarium is one of Europe's largest aquariums. Pavilhão do Conhecimento science museum has hands-on exhibits. Famous Tram 28 rides through hilly Alfama streets. Easy day trips to Cascais beaches and Sintra fairytale palaces.",
        tags: ["Coastal", "Culture", "Historic", "Sunny"],
        image: "https://images.unsplash.com/photo-1536663815808-535e2280d2c2?w=800&q=80",
        scores: { safety: 78, playgrounds: 75, sidewalks: 65, kidActivities: 85, healthyFood: 80, strollerFriendly: 55, accessibility: 65 }
    },
    {
        name: "Edinburgh",
        country: "United Kingdom",
        lat: 55.9533,
        lon: -3.1883,
        shortDescription: "Castle adventures and the world's largest arts festival.",
        description: "Edinburgh Castle captures children's imagination. Dynamic Earth offers interactive science exhibits. Royal Botanic Garden provides free entry and open spaces. During August, the Fringe Festival has dedicated children's programming.",
        tags: ["Historic", "Castle", "Culture", "Nature"],
        image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&q=80",
        scores: { safety: 80, playgrounds: 78, sidewalks: 75, kidActivities: 85, healthyFood: 75, strollerFriendly: 60, accessibility: 70 }
    },
    {
        name: "Dublin",
        country: "Ireland",
        lat: 53.3498,
        lon: -6.2603,
        shortDescription: "Phoenix Park and welcoming Irish hospitality.",
        description: "Phoenix Park is one of largest enclosed city parks in Europe with Dublin Zoo. Imaginosity children's museum offers interactive play. Irish hospitality makes families feel welcome. Compact city center easy to navigate.",
        tags: ["Parks", "Friendly", "Culture", "Historic"],
        image: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80",
        scores: { safety: 75, playgrounds: 80, sidewalks: 78, kidActivities: 82, healthyFood: 72, strollerFriendly: 75, accessibility: 78 }
    },
    {
        name: "Stockholm",
        country: "Sweden",
        lat: 59.3293,
        lon: 18.0686,
        shortDescription: "Skansen open-air museum and archipelago adventures.",
        description: "Skansen is the world's oldest open-air museum with Nordic animals and historic buildings. Junibacken brings Astrid Lindgren's stories to life. Gröna Lund amusement park on the waterfront. Easy ferry access to archipelago islands.",
        tags: ["Museums", "Nature", "Safe", "Islands"],
        image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
        scores: { safety: 85, playgrounds: 85, sidewalks: 88, kidActivities: 90, healthyFood: 80, strollerFriendly: 85, accessibility: 88 }
    },
    {
        name: "Munich",
        country: "Germany",
        lat: 48.1351,
        lon: 11.5820,
        shortDescription: "Deutsches Museum and massive English Garden.",
        description: "Deutsches Museum is world's largest science and technology museum with interactive exhibits. English Garden is one of world's largest urban parks with playgrounds, lakes, and beer gardens. Easy day trips to Bavarian castles and Alps.",
        tags: ["Museums", "Parks", "Culture", "Nature"],
        image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&q=80",
        scores: { safety: 88, playgrounds: 85, sidewalks: 90, kidActivities: 92, healthyFood: 78, strollerFriendly: 85, accessibility: 88 }
    },
    {
        name: "Budapest",
        country: "Hungary",
        lat: 47.4979,
        lon: 19.0402,
        shortDescription: "Europe's biggest playground and family thermal baths.",
        description: "City Park playground covers 13,000 m² with climbing towers, zip lines, and sensory equipment for disabled children. Széchenyi Thermal Baths welcome kids in warm outdoor pools year-round. Castle District has underground climbing tunnels. Affordable family destination.",
        tags: ["Playgrounds", "Baths", "Historic", "Affordable"],
        image: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=80",
        scores: { safety: 78, playgrounds: 95, sidewalks: 75, kidActivities: 88, healthyFood: 72, strollerFriendly: 70, accessibility: 75 }
    },
    {
        name: "Zurich",
        country: "Switzerland",
        lat: 47.3769,
        lon: 8.5417,
        shortDescription: "150+ playgrounds and Europe's safest streets.",
        description: "Over 150 playgrounds throughout the city. Zurich Zoo features Masoala Rainforest hall. Swiss Transport Museum in nearby Lucerne is highly interactive. Crime rate of just 21.2/100 - among world's safest. Clean, efficient public transport.",
        tags: ["Safe", "Clean", "Playgrounds", "Nature"],
        image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=80",
        scores: { safety: 95, playgrounds: 90, sidewalks: 95, kidActivities: 85, healthyFood: 85, strollerFriendly: 90, accessibility: 95 }
    },
    {
        name: "Madrid",
        country: "Spain",
        lat: 40.4168,
        lon: -3.7038,
        shortDescription: "Retiro Park rowboats and Madrid Río splash zones.",
        description: "Retiro Park features playgrounds, puppet shows, and rowboats on the lake. Madrid Río area has creative play structures and splash zones. Sunny weather year-round. Relaxed pace with outdoor cafes and late dining culture welcoming to families.",
        tags: ["Parks", "Sunny", "Culture", "Urban"],
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
        scores: { safety: 72, playgrounds: 85, sidewalks: 80, kidActivities: 85, healthyFood: 85, strollerFriendly: 78, accessibility: 78 }
    },
    {
        name: "Florence",
        country: "Italy",
        lat: 43.7696,
        lon: 11.2558,
        shortDescription: "Renaissance art and Boboli Gardens exploration.",
        description: "Boboli Gardens offer expansive outdoor space behind Pitti Palace. Many museums have children's programs. Gelato culture delights kids on every corner. Can be crowded in summer - consider shoulder seasons for easier navigation with strollers.",
        tags: ["Art", "Gardens", "Historic", "Gelato"],
        image: "https://images.unsplash.com/photo-1543429258-c5ca3a1c90d9?w=800&q=80",
        scores: { safety: 75, playgrounds: 68, sidewalks: 55, kidActivities: 75, healthyFood: 90, strollerFriendly: 45, accessibility: 55 }
    },
    {
        name: "Reykjavik",
        country: "Iceland",
        lat: 64.1466,
        lon: -21.9426,
        shortDescription: "Whale watching and geothermal swimming pools.",
        description: "Iceland ranked world's safest country for 10+ consecutive years. Perlan museum has real ice cave walk-through. FlyOver Iceland motion ride. Laugardalslaug geothermal pool is largest in Iceland with slides. Family Park and Zoo has native animals and amusement rides. Blue Lagoon welcomes kids 2+.",
        tags: ["Safe", "Nature", "Unique", "Adventure"],
        image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80",
        scores: { safety: 98, playgrounds: 75, sidewalks: 80, kidActivities: 88, healthyFood: 75, strollerFriendly: 75, accessibility: 80 }
    },
    {
        name: "Oslo",
        country: "Norway",
        lat: 59.9139,
        lon: 10.7522,
        shortDescription: "Viking ships and sculpture parks for exploration.",
        description: "Vigeland Sculpture Park features 200+ sculptures in open parkland. Viking Ship Museum captures imagination. TusenFryd amusement park nearby. Norwegian Folk Museum is kid-friendly open-air museum. Norway consistently ranks among world's safest countries.",
        tags: ["Museums", "Nature", "Safe", "Vikings"],
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
        scores: { safety: 92, playgrounds: 82, sidewalks: 88, kidActivities: 85, healthyFood: 78, strollerFriendly: 85, accessibility: 88 }
    },
];

export const seedDestinations = mutation({
    args: {},
    handler: async (ctx) => {
        for (const city of cities) {
            const inputs: ScoreInputs = {
                // Existing infrastructure data (converted from old scores)
                playgroundCount: Math.round(city.scores.playgrounds / 5),
                parkCount: Math.round(city.scores.kidActivities / 10),
                averageRating: 4.0 + (city.scores.kidActivities / 100),
                sidewalkWidth: city.scores.sidewalks / 100,
                pedestrianZones: city.scores.sidewalks > 80 ? 1 : 0.7,
                attractions: [
                    { type: "museum", name: "Children's Museum" },
                    { type: "park", name: "Central Park" },
                    { type: "zoo", name: "City Zoo" },
                ],
                healthyRestaurants: Math.round(city.scores.healthyFood / 5),
                totalRestaurants: 50,
                strollerMentions: city.scores.strollerFriendly,
                wheelchairAccessible: Math.round(city.scores.accessibility / 5),

                // NEW: Safety infrastructure (estimated from old safety score)
                lightingCount: Math.round(city.scores.safety * 2),
                policeCount: Math.round(city.scores.safety / 10),
                hospitalCount: Math.round(city.scores.safety / 15),
                fireStationCount: Math.round(city.scores.safety / 20),
                advisoryLevel: city.scores.safety >= 80 ? 'none' : city.scores.safety >= 60 ? 'caution' : 'reconsider',

                // NEW: Weather data (null for seed data - will be fetched on refresh)
                avgTempSummer: null,
                avgTempWinter: null,
                avgPrecipitation: null,

                // NEW: Cost data (null for seed data - will be fetched on refresh)
                costIndex: null,
            };

            const { scores: allScores, dataQuality } = calculateAllScores(inputs);
            const radarChart = getRadarChartData(allScores);
            const fullName = `${city.name}, ${city.country}`;

            const data = {
                name: fullName,
                country: city.country,
                coordinates: { lat: city.lat, lon: city.lon },
                allScores: {
                    ...allScores,
                    familyScore: allScores.familyScore ?? undefined, // Convert null to undefined for Convex
                },
                dataQuality,
                popularity: {
                    searchCount: 0,
                    lastSearched: Date.now(),
                    isTop100: false,
                },
                radarChart,
                attractions: ["City Park", "National Museum", "Zoo", "Science Center"],
                description: city.description,
                shortDescription: city.shortDescription,
                tags: city.tags,
                image: city.image,
                lastUpdated: Date.now(),
            };

            const existing = await ctx.db
                .query("destinations")
                .withIndex("by_name", (q) => q.eq("name", fullName))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, data);
            } else {
                await ctx.db.insert("destinations", data);
            }
        }
    },
});
