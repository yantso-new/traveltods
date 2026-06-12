import { v } from "convex/values";
import { action, mutation, query, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import {
    calculateAllScores,
    getRadarChartData,
    ScoreInputs,
    Attraction,
} from "./lib/scores";
import {
    getCoordinates,
    getOverpassData,
    getOpenTripMapData,
    getWikipediaData,
    getUnsplashCityImage,
    getTravelTablesData,
    getOpenMeteoClimate,
    getSafetyInfrastructure,
    getTravelAdvisory,
    getNeighborhoods,
    getFamilySuggestions,
} from "./lib/api_clients";
import { searchFamilyVenues } from "./lib/foursquare";
import {
    COUNTRY_DESTINATION_SUGGESTIONS,
    MIN_DESTINATIONS_PER_COUNTRY,
} from "./lib/country_destinations";

const UNKNOWN_COUNTRY = "unknown";

function capitalizeWord(word: string) {
    if (word === word.toUpperCase() && word.length > 1) {
        return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function normalizeCountryName(country: string) {
    return country
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .map((part) => part.split("-").map(capitalizeWord).join("-"))
        .join(" ");
}

function normalizeDestinationName(name: string, country: string) {
    const normalizedCountry = normalizeCountryName(country);
    const parts = name.trim().replace(/\s+/g, " ").split(",");

    if (parts.length < 2) {
        return name.trim().replace(/\s+/g, " ");
    }

    const city = parts[0].trim();
    return `${city}, ${normalizedCountry}`;
}

function destinationKey(name: string, country: string) {
    return normalizeDestinationName(name, country).toLowerCase();
}

function isUnknownCountry(country: string) {
    return normalizeCountryName(country).toLowerCase() === UNKNOWN_COUNTRY;
}

// Mutation to save or update a destination (updated for new schema)
export const saveDestination = mutation({
    args: {
        name: v.string(),
        country: v.string(),
        coordinates: v.object({
            lat: v.number(),
            lon: v.number(),
        }),
        allScores: v.object({
            safety: v.number(),
            playgrounds: v.number(),
            sidewalks: v.number(),
            kidActivities: v.number(),
            healthyFood: v.number(),
            strollerFriendly: v.number(),
            accessibility: v.number(),
            weatherComfort: v.number(),
            costAffordability: v.number(),
            familyScore: v.optional(v.number()),
        }),
        rawData: v.optional(v.object({
            travelTables: v.optional(v.object({
                costIndex: v.optional(v.number()),
                avgRent: v.optional(v.number()),
                avgSalary: v.optional(v.number()),
                fetchedAt: v.optional(v.number()),
            })),
            weather: v.optional(v.object({
                avgTempSummer: v.optional(v.number()),
                avgTempWinter: v.optional(v.number()),
                avgPrecipitation: v.optional(v.number()),
                fetchedAt: v.optional(v.number()),
            })),
            safety: v.optional(v.object({
                lightingCount: v.optional(v.number()),
                policeCount: v.optional(v.number()),
                hospitalCount: v.optional(v.number()),
                fireStationCount: v.optional(v.number()),
                advisoryLevel: v.optional(v.string()),
                fetchedAt: v.optional(v.number()),
            })),
        })),
        dataQuality: v.optional(v.object({
            completedMetrics: v.array(v.string()),
            missingMetrics: v.array(v.string()),
            completenessScore: v.number(),
            hasReliableOverallScore: v.boolean(),
        })),
        popularity: v.optional(v.object({
            searchCount: v.number(),
            lastSearched: v.number(),
            isTop100: v.boolean(),
        })),
        radarChart: v.array(
            v.object({
                subject: v.string(),
                A: v.number(),
                fullMark: v.number(),
            })
        ),
        attractions: v.array(v.string()),
        description: v.optional(v.string()),
        shortDescription: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        image: v.optional(v.string()),
        suggestions: v.optional(v.object({
            freeActivities: v.array(v.object({
                name: v.string(),
                type: v.string(),
                description: v.optional(v.string()),
                address: v.optional(v.string()),
                coordinates: v.optional(v.object({ lat: v.number(), lon: v.number() })),
            })),
            downtime: v.array(v.object({
                name: v.string(),
                type: v.string(),
                description: v.optional(v.string()),
                address: v.optional(v.string()),
                coordinates: v.optional(v.object({ lat: v.number(), lon: v.number() })),
            })),
            cafes: v.array(v.object({
                name: v.string(),
                address: v.string(),
                rating: v.optional(v.number()),
                priceLevel: v.optional(v.string()),
                kidFeatures: v.optional(v.array(v.string())),
                cuisine: v.optional(v.string()),
                hours: v.optional(v.string()),
                tips: v.optional(v.string()),
            })),
            restaurants: v.array(v.object({
                name: v.string(),
                address: v.string(),
                rating: v.optional(v.number()),
                priceLevel: v.optional(v.string()),
                kidFeatures: v.optional(v.array(v.string())),
                cuisine: v.optional(v.string()),
                hours: v.optional(v.string()),
                tips: v.optional(v.string()),
            })),
        })),
        neighborhoods: v.optional(v.array(v.object({
            name: v.string(),
            description: v.optional(v.string()),
            tag: v.optional(v.string()),
            center: v.object({ lat: v.number(), lon: v.number() }),
            scores: v.object({
                parks: v.number(),
                cafes: v.number(),
                restaurants: v.number(),
                safety: v.number(),
                walkability: v.number(),
                affordability: v.number(),
            }),
        }))),
    },
    handler: async (ctx, args) => {
        const country = normalizeCountryName(args.country);
        const name = normalizeDestinationName(args.name, country);

        if (!country || isUnknownCountry(country)) {
            throw new Error("Destination country must be selected before saving");
        }

        const existingByName = await ctx.db
            .query("destinations")
            .withIndex("by_name", (q) => q.eq("name", name))
            .first();
        const existing = existingByName ?? (await ctx.db.query("destinations").collect())
            .find((destination) => destinationKey(destination.name, destination.country) === destinationKey(name, country));

        const data = {
            ...args,
            name,
            country,
            lastUpdated: Date.now(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        } else {
            const newId = await ctx.db.insert("destinations", data);
            return newId;
        }
    },
});

// Query to get a destination by name
export const getDestination = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("destinations")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();
    },
});

// Get all destinations
export const getAllDestinations = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("destinations").collect();
    },
});

// Lightweight inventory for scripts that should not pull large nested documents.
export const getDestinationInventory = query({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.db.query("destinations").collect();
        return destinations.map((d) => ({
            name: d.name,
            country: d.country,
        }));
    },
});

export const getCountryDestinationCount = query({
    args: { country: v.string() },
    handler: async (ctx, args) => {
        const country = normalizeCountryName(args.country);
        const destinations = await ctx.db
            .query("destinations")
            .withIndex("by_country", (q) => q.eq("country", country))
            .collect();

        return destinations.length;
    },
});

export const getDestinationsWithUnknownCountry = query({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.db.query("destinations").collect();

        return destinations
            .filter((destination) => isUnknownCountry(destination.country))
            .map((destination) => ({
                _id: destination._id,
                name: destination.name,
                country: destination.country,
                lastUpdated: destination.lastUpdated,
                searchCount: destination.popularity?.searchCount ?? 0,
            }));
    },
});

export const deleteDestinationsWithUnknownCountry = mutation({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.db.query("destinations").collect();
        const toDelete = destinations.filter((destination) => isUnknownCountry(destination.country));

        for (const destination of toDelete) {
            await ctx.db.delete(destination._id);
        }

        return {
            deletedCount: toDelete.length,
            deleted: toDelete.map((destination) => ({
                _id: destination._id,
                name: destination.name,
                country: destination.country,
            })),
        };
    },
});

export const normalizeDestinationCasing = mutation({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.db.query("destinations").collect();
        const updated = [];

        for (const destination of destinations) {
            const country = normalizeCountryName(destination.country);
            const name = normalizeDestinationName(destination.name, country);

            if (destination.country !== country || destination.name !== name) {
                await ctx.db.patch(destination._id, {
                    country,
                    name,
                    lastUpdated: Date.now(),
                });

                updated.push({
                    _id: destination._id,
                    from: {
                        name: destination.name,
                        country: destination.country,
                    },
                    to: {
                        name,
                        country,
                    },
                });
            }
        }

        return {
            updatedCount: updated.length,
            updated,
        };
    },
});

// Get top-rated destinations (familyScore >= 80, i.e., rating 8+)
export const getTopRatedDestinations = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const allDestinations = await ctx.db.query("destinations").collect();

        // Filter for destinations with familyScore >= 80 (rating 8+)
        const topRated = allDestinations
            .sort((a, b) => (b.allScores?.familyScore || 0) - (a.allScores?.familyScore || 0));

        // Apply limit if provided
        if (args.limit) {
            return topRated.slice(0, args.limit);
        }

        return topRated;
    },
});

// Get top 100 destinations by search count
export const getTop100Destinations = query({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.db.query("destinations").collect();

        // Sort by search count and take top 100
        const sorted = destinations
            .sort((a, b) => (b.popularity?.searchCount || 0) - (a.popularity?.searchCount || 0))
            .slice(0, 100);

        return sorted.map(d => ({
            _id: d._id,
            name: d.name,
            searchCount: d.popularity?.searchCount || 0,
            lastUpdated: d.lastUpdated,
            isTop100: d.popularity?.isTop100 || false,
        }));
    },
});

// Get all destinations for a specific country
export const getDestinationsByCountry = query({
    args: { country: v.string() },
    handler: async (ctx, args) => {
        const destinations = await ctx.db
            .query("destinations")
            .withIndex("by_country", (q) => q.eq("country", args.country))
            .collect();

        // Sort by family score
        return destinations.sort((a, b) => 
            (b.allScores?.familyScore || 0) - (a.allScores?.familyScore || 0)
        );
    },
});

// Get all unique countries
export const getAllCountries = query({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.db.query("destinations").collect();
        
        // Group by country and calculate stats
        const countryMap = new Map<string, {
            count: number;
            totalScore: number;
            topScore: number;
            topDestination: string;
        }>();

        for (const dest of destinations) {
            const country = dest.country;
            if (!country) continue;

            const score = dest.allScores?.familyScore ?? 0;

            if (!countryMap.has(country)) {
                countryMap.set(country, {
                    count: 1,
                    totalScore: score,
                    topScore: score,
                    topDestination: dest.name,
                });
            } else {
                const stats = countryMap.get(country)!;
                stats.count++;
                stats.totalScore += score;
                if (score > stats.topScore) {
                    stats.topScore = score;
                    stats.topDestination = dest.name;
                }
            }
        }

        // Build result array
        const countries = Array.from(countryMap.entries()).map(([name, stats]) => ({
            name,
            destinationCount: stats.count,
            avgFamilyScore: Math.round(stats.totalScore / stats.count),
            topDestination: stats.topDestination,
        }));

        // Sort by destination count descending
        countries.sort((a, b) => b.destinationCount - a.destinationCount);
        return countries;
    },
});

// Increment search count when a destination is viewed
export const incrementSearchCount = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const destination = await ctx.db
            .query("destinations")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (destination) {
            const currentCount = destination.popularity?.searchCount || 0;
            await ctx.db.patch(destination._id, {
                popularity: {
                    searchCount: currentCount + 1,
                    lastSearched: Date.now(),
                    isTop100: destination.popularity?.isTop100 || false,
                },
            });
        }
    },
});

// Update isTop100 flags for all destinations (internal mutation for cron)
export const updateTop100Flags = internalMutation({
    handler: async (ctx) => {
        const allDestinations = await ctx.db.query("destinations").collect();

        // Sort by search count
        const sorted = allDestinations.sort((a, b) =>
            (b.popularity?.searchCount || 0) - (a.popularity?.searchCount || 0)
        );

        // Update flags
        for (let i = 0; i < sorted.length; i++) {
            const isTop100 = i < 100;
            const currentFlag = sorted[i].popularity?.isTop100 || false;

            // Only update if flag changed
            if (currentFlag !== isTop100) {
                await ctx.db.patch(sorted[i]._id, {
                    popularity: {
                        searchCount: sorted[i].popularity?.searchCount || 0,
                        lastSearched: sorted[i].popularity?.lastSearched || Date.now(),
                        isTop100,
                    },
                });
            }
        }

        console.log(`Updated top 100 flags for ${sorted.length} destinations`);
    },
});

// Action to gather data and compute scores (UPDATED with new APIs)
export const gatherDestination = action({
    args: {
        city: v.string(),
        country: v.string(),
        skipCountryBackfill: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const city = args.city.trim().replace(/\s+/g, " ");
        const country = normalizeCountryName(args.country);

        if (!country || isUnknownCountry(country)) {
            return { success: false, error: "Country is required. Select a destination from the autocomplete list." };
        }

        console.log(`Gathering real data for ${city}, ${country}`);
        const fullName = `${city}, ${country}`;

        // 1. Fetch Coordinates
        const coords = await getCoordinates(city, country);
        if (!coords) {
            return { success: false, error: "Coordinates not found" };
        }

        // 2. Fetch Data from ALL APIs in parallel
        const [
            osmData,
            otmData,
            wikiData,
            unsplashData,
            costData,
            weatherData,
            safetyData,
            advisoryData,
            neighborhoodsData,
            suggestionsData,
            familyVenuesData
        ] = await Promise.all([
            getOverpassData(coords.lat, coords.lon),
            getOpenTripMapData(coords.lat, coords.lon),
            getWikipediaData(city, country),
            getUnsplashCityImage(city, country),
            getTravelTablesData(city, country),
            getOpenMeteoClimate(coords.lat, coords.lon),
            getSafetyInfrastructure(coords.lat, coords.lon),
            getTravelAdvisory(country),
            getNeighborhoods(coords.lat, coords.lon, city),
            getFamilySuggestions(coords.lat, coords.lon),
            searchFamilyVenues(coords.lat, coords.lon, "both"),
        ]);

        // 3. Construct Score Inputs with all new data
        const scoreInputs: ScoreInputs = {
            // Existing infrastructure data
            playgroundCount: osmData.playgrounds,
            parkCount: 5, // Estimated from data
            averageRating: 4.0, // Default rating
            sidewalkWidth: Math.min(osmData.footways / 500, 1.0),
            pedestrianZones: osmData.footways > 100 ? 1 : 0.5,
            attractions: otmData.attractions,
            healthyRestaurants: otmData.healthyRestaurants,
            totalRestaurants: otmData.totalRestaurants,
            strollerMentions: 50,
            wheelchairAccessible: osmData.accessibleSpots,

            // NEW: Safety infrastructure data
            lightingCount: safetyData.lightingCount,
            policeCount: safetyData.policeCount,
            hospitalCount: safetyData.hospitalCount,
            fireStationCount: safetyData.fireStationCount,
            advisoryLevel: advisoryData.advisoryLevel,

            // NEW: Weather data (nullable)
            avgTempSummer: weatherData.avgTempSummer,
            avgTempWinter: weatherData.avgTempWinter,
            avgPrecipitation: weatherData.avgPrecipitation,

            // NEW: Cost data (nullable)
            costIndex: costData.costIndex,
        };

        // 4. Calculate Scores with Data Quality
        const { scores: allScores, dataQuality } = calculateAllScores(scoreInputs);
        const radarChart = getRadarChartData(allScores);

        // 5. Construct Metadata
        const description = wikiData.description ||
            `Discover ${city}, a destination in ${country}. Explore what this location has to offer for families and travelers.`;
        const shortDescription = `Discover ${city} in ${country}.`;

        // Resolve Image: Prefer Unsplash if it's not a fallback. 
        // If it is a fallback, but we have a Wikipedia image, use Wikipedia instead.
        // Otherwise use the Unsplash result (which might be a fallback).
        let cityImage = unsplashData.url;

        if (unsplashData.isFallback && wikiData.imageUrl) {
            console.log(`Using Wikipedia image for ${fullName} because Unsplash returned fallback`);
            cityImage = wikiData.imageUrl;
        }

        // Dynamic tags based on scores and data quality
        const tags: string[] = [];
        if (dataQuality.hasReliableOverallScore) tags.push("Verified");
        if (allScores.safety >= 80) tags.push("Safe");
        if (allScores.costAffordability >= 70) tags.push("Budget-Friendly");
        if (allScores.weatherComfort >= 75) tags.push("Great Weather");
        if (allScores.playgrounds >= 70) tags.push("Kid-Friendly");
        if (allScores.accessibility >= 70) tags.push("Accessible");

        // 6. Prepare raw data for transparency
        const rawData = {
            travelTables: costData.success ? {
                costIndex: costData.costIndex ?? undefined,
                avgRent: costData.avgRent ?? undefined,
                avgSalary: costData.avgSalary ?? undefined,
                fetchedAt: Date.now(),
            } : undefined,
            weather: weatherData.success ? {
                avgTempSummer: weatherData.avgTempSummer ?? undefined,
                avgTempWinter: weatherData.avgTempWinter ?? undefined,
                avgPrecipitation: weatherData.avgPrecipitation ?? undefined,
                fetchedAt: Date.now(),
            } : undefined,
            safety: safetyData.success ? {
                lightingCount: safetyData.lightingCount,
                policeCount: safetyData.policeCount,
                hospitalCount: safetyData.hospitalCount,
                fireStationCount: safetyData.fireStationCount,
                advisoryLevel: advisoryData.advisoryLevel,
                fetchedAt: Date.now(),
            } : undefined,
        };

        // 7. Save to DB with all new fields
        console.log(`Saving verified destination to DB: ${fullName}`);
        await ctx.runMutation(api.destinations.saveDestination, {
            name: fullName,
            country,
            coordinates: coords,
            allScores: {
                ...allScores,
                familyScore: allScores.familyScore ?? undefined, // Convert null to undefined for Convex
            },
            rawData,
            dataQuality,
            popularity: {
                searchCount: 1, // Initialize with 1 (this is a search)
                lastSearched: Date.now(),
                isTop100: false,
            },
            radarChart,
            attractions: otmData.attractions.map((a: Attraction) => a.name),
            description,
            shortDescription,
            tags,
            image: cityImage,
            suggestions: {
                freeActivities: suggestionsData.freeActivities.slice(0, 8),
                downtime: suggestionsData.downtime.slice(0, 6),
                cafes: familyVenuesData.success 
                    ? familyVenuesData.venues.filter(v => v.categories.some(c => c.toLowerCase().includes('cafe') || c.toLowerCase().includes('coffee'))).slice(0, 8)
                    : suggestionsData.cafes.slice(0, 8),
                restaurants: familyVenuesData.success
                    ? familyVenuesData.venues.filter(v => v.categories.some(c => c.toLowerCase().includes('restaurant'))).slice(0, 8)
                    : suggestionsData.restaurants.slice(0, 8),
            },
            neighborhoods: neighborhoodsData.slice(0, 10),
        });

        // 8. Increment search count
        await ctx.runMutation(api.destinations.incrementSearchCount, { name: fullName });

        if (!args.skipCountryBackfill) {
            const countryCount = await ctx.runQuery(api.destinations.getCountryDestinationCount, { country });
            if (countryCount < MIN_DESTINATIONS_PER_COUNTRY) {
                await ctx.runAction(api.destinations.backfillCountryDestinations, {
                    country,
                    minimum: MIN_DESTINATIONS_PER_COUNTRY,
                });
            }
        }

        return {
            success: true,
            allScores,
            dataQuality,
        };
    },
});

export const backfillCountryDestinations = action({
    args: {
        country: v.string(),
        minimum: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const country = normalizeCountryName(args.country);
        const minimum = args.minimum ?? MIN_DESTINATIONS_PER_COUNTRY;
        const suggestions = COUNTRY_DESTINATION_SUGGESTIONS[country] ?? [];

        if (!suggestions.length) {
            return {
                success: false,
                country,
                added: 0,
                failed: 0,
                error: "No destination suggestions configured for country",
            };
        }

        const inventory = await ctx.runQuery(api.destinations.getDestinationInventory);
        const existingNames = new Set(
            inventory
                .filter((destination) => normalizeCountryName(destination.country) === country)
                .map((destination) => normalizeDestinationName(destination.name, country).toLowerCase())
        );

        const planned = suggestions
            .filter((city) => !existingNames.has(`${city}, ${country}`.toLowerCase()))
            .slice(0, Math.max(0, minimum - existingNames.size));

        let added = 0;
        let failed = 0;
        const failures: { city: string; error: string }[] = [];

        for (const city of planned) {
            const result: any = await ctx.runAction(api.destinations.gatherDestination, {
                city,
                country,
                skipCountryBackfill: true,
            });

            if (result?.success) {
                added++;
            } else {
                failed++;
                failures.push({ city, error: result?.error ?? "Unknown failure" });
            }
        }

        return {
            success: failed === 0,
            country,
            added,
            failed,
            failures,
        };
    },
});

// Mutation to update just the image for a destination
export const updateDestinationImage = mutation({
    args: {
        name: v.string(),
        image: v.string(),
    },
    handler: async (ctx, args) => {
        const destination = await ctx.db
            .query("destinations")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (destination) {
            await ctx.db.patch(destination._id, {
                image: args.image,
                lastUpdated: Date.now(),
            });
            return { success: true };
        }
        return { success: false, error: "Destination not found" };
    },
});

// Known fallback image IDs that indicate generic/incorrect images
const FALLBACK_IMAGE_IDS = [
    'photo-1480714378408-67cf0d13bc1b', // NYC skyline
    'photo-1477959858617-67f85cf4f1df', // City aerial
    'photo-1449824913935-59a10b8d2000', // City buildings
    'photo-1444723121867-7a241cacace9', // City bridge
    'photo-1519501025264-65ba15a82390', // Hong Kong skyline
    'photo-1513635269975-59663e0ac1ad', // London architecture
    'photo-1502602898657-3e91760cbb34', // Paris architecture
];

// Action to refresh images for destinations with fallback images
export const refreshDestinationImages = action({
    args: {
        destinationNames: v.optional(v.array(v.string())), // If empty, refresh all with fallbacks
    },
    handler: async (ctx, args) => {
        // Get all destinations
        const allDestinations = await ctx.runQuery(api.destinations.getAllDestinations);

        // Filter to those with fallback images (or specified names)
        let toRefresh = allDestinations;

        if (args.destinationNames && args.destinationNames.length > 0) {
            toRefresh = allDestinations.filter((d: any) => args.destinationNames!.includes(d.name));
        } else {
            // Filter to destinations with fallback images
            toRefresh = allDestinations.filter((d: any) => {
                if (!d.image) return true;
                return FALLBACK_IMAGE_IDS.some(id => d.image?.includes(id));
            });
        }

        console.log(`Refreshing images for ${toRefresh.length} destinations`);

        const results: { name: string; success: boolean; newImage?: string; error?: string }[] = [];

        for (const dest of toRefresh) {
            try {
                // Extract city and country from name (format: "City, Country")
                const parts = dest.name.split(', ');
                const city = parts[0];
                const country = dest.country || (parts.length > 1 ? parts[1] : "Unknown");

                console.log(`Fetching new image for ${city}, ${country}...`);

                // Fetch new image from Unsplash
                const unsplashResult = await getUnsplashCityImage(city, country);

                // Also try Wikipedia as fallback
                let finalImage = unsplashResult.url;
                if (unsplashResult.isFallback) {
                    const wikiData = await getWikipediaData(city, country);
                    if (wikiData.imageUrl) {
                        finalImage = wikiData.imageUrl;
                        console.log(`Using Wikipedia image for ${dest.name}`);
                    }
                }

                // Update the image
                await ctx.runMutation(api.destinations.updateDestinationImage, {
                    name: dest.name,
                    image: finalImage,
                });

                results.push({
                    name: dest.name,
                    success: true,
                    newImage: finalImage,
                });

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`Error refreshing image for ${dest.name}:`, error);
                results.push({
                    name: dest.name,
                    success: false,
                    error: String(error),
                });
            }
        }

        return {
            refreshed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        };
    },
});
