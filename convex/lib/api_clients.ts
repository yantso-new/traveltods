import { Attraction } from "./scores";

// Fetch a city image from Unsplash API
export interface UnsplashImageResult {
    url: string;
    isFallback: boolean;
}

// Fetch a city image from Unsplash API
export async function getUnsplashCityImage(city: string, country: string): Promise<UnsplashImageResult> {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    // If no API key, return a generic travel image from Unsplash CDN
    if (!apiKey) {
        console.log("No UNSPLASH_ACCESS_KEY found, using fallback image");
        return { url: getFallbackImage(city), isFallback: true };
    }

    // Search for images focusing on architecture/landscapes without people
    const searchQuery = `${city} ${country} architecture cityscape landmark -people -person -crowd`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=landscape&client_id=${apiKey}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("Unsplash API error:", res.status, await res.text());
            return { url: getFallbackImage(city), isFallback: true };
        }

        const data = await res.json();

        if (data.results && data.results.length > 0) {
            // Filter images to find only scenery without people
            // Check descriptions and tags for people-related keywords
            const sceneryImages = data.results.filter((photo: any) => {
                const desc = (photo.description || '').toLowerCase();
                const altDesc = (photo.alt_description || '').toLowerCase();
                const combinedText = desc + ' ' + altDesc;

                // Comprehensive list of keywords that indicate people in photos
                const peopleKeywords = [
                    'people', 'person', 'persons', 'crowd', 'crowds',
                    'man', 'men', 'woman', 'women', 'boy', 'girl',
                    'tourist', 'tourists', 'traveler', 'travelers',
                    'pedestrian', 'pedestrians', 'visitor', 'visitors',
                    'human', 'humans', 'face', 'faces', 'portrait',
                    'group', 'couple', 'family', 'walking', 'standing',
                    'sitting', 'street photography', 'candid'
                ];

                // Check if any people-related keyword is present
                const hasPeople = peopleKeywords.some(keyword =>
                    combinedText.includes(keyword)
                );

                return !hasPeople;
            });

            // Prioritize scenic images with architectural/landscape keywords
            const priorityImage = sceneryImages.find((photo: any) => {
                const desc = (photo.description || '').toLowerCase();
                const altDesc = (photo.alt_description || '').toLowerCase();
                const combinedText = desc + ' ' + altDesc;

                return combinedText.includes('architecture') ||
                    combinedText.includes('building') ||
                    combinedText.includes('skyline') ||
                    combinedText.includes('landscape') ||
                    combinedText.includes('aerial') ||
                    combinedText.includes('cityscape');
            });

            // Use priority scenic image, or first scenic image, or fallback to first result
            const photo = priorityImage || sceneryImages[0] || data.results[0];
            // Return optimized image URL (800px wide, 80% quality)
            return {
                url: `${photo.urls.raw}&w=800&q=80&fit=crop`,
                isFallback: false
            };
        }

        return { url: getFallbackImage(city), isFallback: true };
    } catch (e) {
        console.error("Unsplash fetch error:", e);
        return { url: getFallbackImage(city), isFallback: true };
    }
}

// Fallback images - curated list of city/architecture images from Unsplash (no people)
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80', // NYC skyline
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City aerial
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', // City buildings
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80', // City bridge
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80', // Hong Kong skyline
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', // London architecture
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // Paris architecture
];

function getFallbackImage(city: string): string {
    // Use city name to deterministically pick a fallback image
    const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

export interface WikipediaData {
    description: string | null;
    imageUrl: string | null;
}

export async function getWikipediaData(city: string, country: string): Promise<WikipediaData> {
    const searchQuery = country === "Unknown" ? city : `${city} ${country}`;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;

    try {
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.query?.search?.length) {
            return { description: null, imageUrl: null };
        }

        const pageTitle = searchData.query.search[0].title;
        const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=1000&format=json&origin=*`;

        const extractRes = await fetch(extractUrl);
        const extractData = await extractRes.json();

        const pages = extractData.query?.pages;
        if (!pages) return { description: null, imageUrl: null };

        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        const extract = page?.extract;
        const thumbnail = page?.thumbnail?.source;

        if (!extract) return { description: null, imageUrl: thumbnail || null };

        // Get first 2-3 sentences for a concise description
        const sentences = extract.split(/(?<=[.!?])\s+/);
        const description = sentences.slice(0, 3).join(' ').trim();

        // Limit to reasonable length
        const finalDescription = description.length > 500 ? description.substring(0, 497) + '...' : description;

        return {
            description: finalDescription,
            imageUrl: thumbnail || null
        };
    } catch (e) {
        console.error("Wikipedia API error:", e);
        return { description: null, imageUrl: null };
    }
}

export async function getCoordinates(city: string, country: string) {
    const fullName = country === "Unknown" ? city : `${city}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullName)}&format=json&limit=1`;

    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Traveltods/1.0' } });
        const data = await res.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
    } catch (e) {
        console.error("Nominatim error:", e);
    }
    return null;
}

export async function getOverpassData(lat: number, lon: number, radius = 5000) {
    // Overpass QL query for playgrounds, footways, and accessibility
    const query = `
        [out:json][timeout:25];
        (
          node["leisure"="playground"](around:${radius},${lat},${lon});
          way["leisure"="playground"](around:${radius},${lat},${lon});
          way["highway"="footway"](around:${radius},${lat},${lon});
          way["highway"="pedestrian"](around:${radius},${lat},${lon});
          node["wheelchair"="yes"](around:${radius},${lat},${lon});
          node["kerb"="lowered"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const elements = data.elements || [];

        return {
            playgrounds: elements.filter((e: any) => e.tags?.leisure === 'playground').length,
            footways: elements.filter((e: any) => e.tags?.highway === 'footway' || e.tags?.highway === 'pedestrian').length,
            accessibleSpots: elements.filter((e: any) => e.tags?.wheelchair === 'yes' || e.tags?.kerb === 'lowered').length,
        };
    } catch (e) {
        console.error("Overpass error:", e);
        return { playgrounds: 0, footways: 0, accessibleSpots: 0 };
    }
}

export async function getOpenTripMapData(lat: number, lon: number, radius = 5000) {
    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) {
        return {
            attractions: [
                { type: "museum", name: "National Kids Museum" },
                { type: "park", name: "Central City Green" },
                { type: "zoo", name: "City Zoo" }
            ],
            healthyRestaurants: 5,
            totalRestaurants: 20
        };
    }

    const bbox = {
        minLon: lon - 0.05,
        maxLon: lon + 0.05,
        minLat: lat - 0.05,
        maxLat: lat + 0.05
    };

    const kinds = "museums,zoo,aquariums,amusement_parks,restaurants";
    const url = `https://api.opentripmap.com/0.1/en/places/bbox?lon_min=${bbox.minLon}&lon_max=${bbox.maxLon}&lat_min=${bbox.minLat}&lat_max=${bbox.maxLat}&kinds=${kinds}&limit=50&apikey=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const features = data.features || [];

        const attractions = features.map((f: any) => ({
            name: f.properties.name || "Unknown Attraction",
            type: f.properties.kinds.split(',')[0],
        })).filter((f: any) => f.name !== "Unknown Attraction");

        const restaurants = features.filter((f: any) => f.properties.kinds.includes('restaurants'));

        return {
            attractions: attractions.slice(0, 5),
            healthyRestaurants: Math.floor(restaurants.length * 0.3), // Simulated ratio
            totalRestaurants: restaurants.length
        };
    } catch (e) {
        console.error("OpenTripMap error:", e);
        return { attractions: [], healthyRestaurants: 0, totalRestaurants: 0 };
    }
}

// ============================================================================
// NEW API CLIENTS FOR AUTOMATED RATING SYSTEM
// ============================================================================

// Response types for new APIs
export interface TravelTablesData {
    costIndex: number | null;
    avgRent: number | null;
    avgSalary: number | null;
    success: boolean;
    error?: string;
}

export interface WeatherData {
    avgTempSummer: number | null;
    avgTempWinter: number | null;
    avgPrecipitation: number | null;
    success: boolean;
    error?: string;
}

export interface SafetyInfrastructureData {
    lightingCount: number;
    policeCount: number;
    hospitalCount: number;
    fireStationCount: number;
    success: boolean;
}

export interface TravelAdvisoryData {
    advisoryLevel: 'none' | 'caution' | 'reconsider' | 'avoid';
    advisoryText: string | null;
    success: boolean;
    error?: string;
}

/**
 * Fetch cost of living data from TravelTables API via RapidAPI
 * Free tier: 1,000 requests/month, 10/hour
 */
export async function getTravelTablesData(city: string, country: string): Promise<TravelTablesData> {
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
        console.warn("RAPIDAPI_KEY not configured - using default cost data");
        return { costIndex: null, avgRent: null, avgSalary: null, success: false, error: "No API key" };
    }

    try {
        const url = `https://cost-of-living-and-prices.p.rapidapi.com/prices?city_name=${encodeURIComponent(city)}&country_name=${encodeURIComponent(country)}`;

        const res = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com'
            }
        });

        if (!res.ok) {
            console.error("TravelTables API error:", res.status);
            return { costIndex: null, avgRent: null, avgSalary: null, success: false, error: `HTTP ${res.status}` };
        }

        const data = await res.json();

        if (data.error || !data.prices) {
            return { costIndex: null, avgRent: null, avgSalary: null, success: false, error: data.error || "No data" };
        }

        // Extract key metrics from the prices array
        const prices = data.prices || [];

        // Find relevant price items
        const rentItem = prices.find((p: any) =>
            p.item_name?.toLowerCase().includes('apartment') &&
            p.item_name?.toLowerCase().includes('1 bedroom') &&
            p.item_name?.toLowerCase().includes('centre')
        );
        const salaryItem = prices.find((p: any) =>
            p.item_name?.toLowerCase().includes('average monthly net salary')
        );

        // Calculate a cost index (normalize based on NYC baseline of ~100)
        // Using rent as primary indicator
        const avgRent = rentItem?.avg ?? null;
        const avgSalary = salaryItem?.avg ?? null;

        // Simple cost index calculation: rent / NYC baseline rent (~$3000) * 100
        let costIndex: number | null = null;
        if (avgRent !== null) {
            costIndex = Math.round((avgRent / 3000) * 100);
        }

        return {
            costIndex,
            avgRent,
            avgSalary,
            success: true,
        };
    } catch (e) {
        console.error("TravelTables fetch error:", e);
        return { costIndex: null, avgRent: null, avgSalary: null, success: false, error: String(e) };
    }
}

/**
 * Fetch historical climate data from Open-Meteo (free, no API key)
 */
export async function getOpenMeteoClimate(lat: number, lon: number): Promise<WeatherData> {
    try {
        // Get climate normals using Open-Meteo's climate API
        // This provides 30-year climate averages
        const url = `https://climate-api.open-meteo.com/v1/climate?` +
            `latitude=${lat}&longitude=${lon}` +
            `&start_date=2010-01-01&end_date=2020-12-31` +
            `&models=EC_Earth3P_HR` +
            `&daily=temperature_2m_mean,precipitation_sum`;

        const res = await fetch(url);

        if (!res.ok) {
            // Fallback to archive API if climate API fails
            return getOpenMeteoArchive(lat, lon);
        }

        const data = await res.json();

        if (!data.daily || !data.daily.time) {
            return getOpenMeteoArchive(lat, lon);
        }

        return processWeatherData(data.daily);
    } catch (e) {
        console.error("Open-Meteo climate error, trying archive:", e);
        return getOpenMeteoArchive(lat, lon);
    }
}

/**
 * Fallback: Use Open-Meteo historical archive
 */
async function getOpenMeteoArchive(lat: number, lon: number): Promise<WeatherData> {
    try {
        const endYear = new Date().getFullYear() - 1;
        const startYear = endYear - 4; // Last 5 years

        const url = `https://archive-api.open-meteo.com/v1/archive?` +
            `latitude=${lat}&longitude=${lon}` +
            `&start_date=${startYear}-01-01&end_date=${endYear}-12-31` +
            `&daily=temperature_2m_mean,precipitation_sum` +
            `&timezone=auto`;

        const res = await fetch(url);

        if (!res.ok) {
            console.error("Open-Meteo archive error:", res.status);
            return { avgTempSummer: null, avgTempWinter: null, avgPrecipitation: null, success: false };
        }

        const data = await res.json();

        if (!data.daily || !data.daily.time) {
            return { avgTempSummer: null, avgTempWinter: null, avgPrecipitation: null, success: false };
        }

        return processWeatherData(data.daily);
    } catch (e) {
        console.error("Open-Meteo archive fetch error:", e);
        return { avgTempSummer: null, avgTempWinter: null, avgPrecipitation: null, success: false, error: String(e) };
    }
}

/**
 * Process weather data to extract seasonal averages
 */
function processWeatherData(dailyData: any): WeatherData {
    const summerTemps: number[] = [];
    const winterTemps: number[] = [];
    let totalPrecip = 0;
    let precipDays = 0;

    dailyData.time.forEach((dateStr: string, i: number) => {
        const month = new Date(dateStr).getMonth();
        const temp = dailyData.temperature_2m_mean?.[i];
        const precip = dailyData.precipitation_sum?.[i];

        if (temp !== null && temp !== undefined) {
            // Summer: Jun (5), Jul (6), Aug (7)
            if (month >= 5 && month <= 7) summerTemps.push(temp);
            // Winter: Dec (11), Jan (0), Feb (1)
            if (month === 11 || month === 0 || month === 1) winterTemps.push(temp);
        }

        if (precip !== null && precip !== undefined) {
            totalPrecip += precip;
            precipDays++;
        }
    });

    const avgSummer = summerTemps.length > 0
        ? summerTemps.reduce((a, b) => a + b, 0) / summerTemps.length
        : null;
    const avgWinter = winterTemps.length > 0
        ? winterTemps.reduce((a, b) => a + b, 0) / winterTemps.length
        : null;

    // Calculate annual precipitation from daily totals
    const yearsOfData = precipDays / 365;
    const avgPrecipPerYear = yearsOfData > 0 ? totalPrecip / yearsOfData : null;

    return {
        avgTempSummer: avgSummer !== null ? Math.round(avgSummer * 10) / 10 : null,
        avgTempWinter: avgWinter !== null ? Math.round(avgWinter * 10) / 10 : null,
        avgPrecipitation: avgPrecipPerYear !== null ? Math.round(avgPrecipPerYear) : null,
        success: avgSummer !== null || avgWinter !== null,
    };
}

/**
 * Fetch safety-related infrastructure from OpenStreetMap via Overpass
 * Uses density of lighting, police, hospitals, fire stations as safety proxy
 */
export async function getSafetyInfrastructure(lat: number, lon: number, radius = 5000): Promise<SafetyInfrastructureData> {
    const query = `
        [out:json][timeout:25];
        (
          node["highway"="street_lamp"](around:${radius},${lat},${lon});
          node["amenity"="police"](around:${radius},${lat},${lon});
          way["amenity"="police"](around:${radius},${lat},${lon});
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="clinic"](around:${radius},${lat},${lon});
          node["amenity"="fire_station"](around:${radius},${lat},${lon});
          way["amenity"="fire_station"](around:${radius},${lat},${lon});
        );
        out count;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const elements = data.elements || [];

        // Count each type of safety infrastructure
        let lightingCount = 0;
        let policeCount = 0;
        let hospitalCount = 0;
        let fireStationCount = 0;

        // If using count output, parse differently
        if (data.elements && data.elements[0]?.tags?.total) {
            // Fallback to detailed query if count doesn't work
            return getSafetyInfrastructureDetailed(lat, lon, radius);
        }

        elements.forEach((e: any) => {
            if (e.tags?.highway === 'street_lamp') lightingCount++;
            if (e.tags?.amenity === 'police') policeCount++;
            if (e.tags?.amenity === 'hospital' || e.tags?.amenity === 'clinic') hospitalCount++;
            if (e.tags?.amenity === 'fire_station') fireStationCount++;
        });

        return {
            lightingCount,
            policeCount,
            hospitalCount,
            fireStationCount,
            success: true,
        };
    } catch (e) {
        console.error("Overpass safety query error:", e);
        return { lightingCount: 0, policeCount: 0, hospitalCount: 0, fireStationCount: 0, success: false };
    }
}

/**
 * Detailed safety infrastructure query (fallback)
 */
async function getSafetyInfrastructureDetailed(lat: number, lon: number, radius: number): Promise<SafetyInfrastructureData> {
    const query = `
        [out:json][timeout:30];
        (
          node["highway"="street_lamp"](around:${radius},${lat},${lon});
          node["amenity"="police"](around:${radius},${lat},${lon});
          way["amenity"="police"](around:${radius},${lat},${lon});
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="clinic"](around:${radius},${lat},${lon});
          node["amenity"="fire_station"](around:${radius},${lat},${lon});
          way["amenity"="fire_station"](around:${radius},${lat},${lon});
        );
        out body;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const elements = data.elements || [];

        const lightingCount = elements.filter((e: any) => e.tags?.highway === 'street_lamp').length;
        const policeCount = elements.filter((e: any) => e.tags?.amenity === 'police').length;
        const hospitalCount = elements.filter((e: any) =>
            e.tags?.amenity === 'hospital' || e.tags?.amenity === 'clinic'
        ).length;
        const fireStationCount = elements.filter((e: any) => e.tags?.amenity === 'fire_station').length;

        return {
            lightingCount,
            policeCount,
            hospitalCount,
            fireStationCount,
            success: true,
        };
    } catch (e) {
        console.error("Overpass detailed safety query error:", e);
        return { lightingCount: 0, policeCount: 0, hospitalCount: 0, fireStationCount: 0, success: false };
    }
}

/**
 * Get travel advisory data based on US State Department levels
 * Uses a static mapping updated from official sources
 */
export async function getTravelAdvisory(country: string): Promise<TravelAdvisoryData> {
    try {
        // Using a curated mapping based on US State Dept travel advisories
        // This avoids XML parsing and provides instant results
        const advisoryLevel = getStaticAdvisoryLevel(country);

        return {
            advisoryLevel,
            advisoryText: getAdvisoryText(advisoryLevel),
            success: true,
        };
    } catch (e) {
        console.error("Travel advisory error:", e);
        return { advisoryLevel: 'none', advisoryText: null, success: false, error: String(e) };
    }
}

/**
 * Static advisory levels for common travel destinations
 * Updated periodically based on US State Dept data
 * Level 1: Exercise Normal Precautions = 'none'
 * Level 2: Exercise Increased Caution = 'caution'
 * Level 3: Reconsider Travel = 'reconsider'
 * Level 4: Do Not Travel = 'avoid'
 */
function getStaticAdvisoryLevel(country: string): 'none' | 'caution' | 'reconsider' | 'avoid' {
    const normalized = country.toLowerCase().trim();

    // Level 4: Do Not Travel
    const avoidCountries = [
        'afghanistan', 'belarus', 'burkina faso', 'central african republic',
        'haiti', 'iran', 'iraq', 'libya', 'mali', 'myanmar', 'burma',
        'north korea', 'russia', 'somalia', 'south sudan', 'sudan', 'syria',
        'ukraine', 'venezuela', 'yemen'
    ];

    // Level 3: Reconsider Travel
    const reconsiderCountries = [
        'pakistan', 'lebanon', 'algeria', 'chad', 'democratic republic of the congo',
        'eritrea', 'mauritania', 'nicaragua', 'niger', 'nigeria', 'papua new guinea',
        'tunisia'
    ];

    // Level 2: Exercise Increased Caution
    const cautionCountries = [
        'argentina', 'bahamas', 'bangladesh', 'belgium', 'brazil', 'china',
        'colombia', 'dominican republic', 'ecuador', 'egypt', 'el salvador',
        'ethiopia', 'france', 'germany', 'guatemala', 'honduras', 'india',
        'indonesia', 'israel', 'jamaica', 'jordan', 'kenya', 'mexico',
        'morocco', 'peru', 'philippines', 'saudi arabia', 'south africa',
        'spain', 'sri lanka', 'tanzania', 'thailand', 'turkey', 'uganda',
        'united kingdom', 'uzbekistan'
    ];

    if (avoidCountries.includes(normalized)) return 'avoid';
    if (reconsiderCountries.includes(normalized)) return 'reconsider';
    if (cautionCountries.includes(normalized)) return 'caution';

    return 'none'; // Default: Exercise Normal Precautions
}

function getAdvisoryText(level: 'none' | 'caution' | 'reconsider' | 'avoid'): string {
    switch (level) {
        case 'none': return 'Exercise normal precautions';
        case 'caution': return 'Exercise increased caution';
        case 'reconsider': return 'Reconsider travel';
        case 'avoid': return 'Do not travel';
    }
}
