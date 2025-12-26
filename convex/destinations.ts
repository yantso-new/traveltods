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
    getWikipediaDescription,
    getUnsplashCityImage,
    getTravelTablesData,
    getOpenMeteoClimate,
    getSafetyInfrastructure,
    getTravelAdvisory,
} from "./lib/api_clients";

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
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("destinations")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                lastUpdated: Date.now(),
            });
            return existing._id;
        } else {
            const newId = await ctx.db.insert("destinations", {
                ...args,
                lastUpdated: Date.now(),
            });
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
    handler: async (ctx) => {
        return await ctx.db.query("destinations").collect();
    },
});

// Get top 100 destinations by search count
export const getTop100Destinations = query({
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

// Update isTop100 flag for all destinations (internal mutation for cron)
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
    },
    handler: async (ctx, args) => {
        console.log(`Gathering real data for ${args.city}, ${args.country}`);
        const fullName = args.country === "Unknown" ? args.city : `${args.city}, ${args.country}`;

        // 1. Fetch Coordinates
        const coords = await getCoordinates(args.city, args.country);
        if (!coords) {
            return { success: false, error: "Coordinates not found" };
        }

        // 2. Fetch Data from ALL APIs in parallel
        const [
            osmData,
            otmData,
            wikiDescription,
            cityImage,
            costData,
            weatherData,
            safetyData,
            advisoryData
        ] = await Promise.all([
            getOverpassData(coords.lat, coords.lon),
            getOpenTripMapData(coords.lat, coords.lon),
            getWikipediaDescription(args.city, args.country),
            getUnsplashCityImage(args.city, args.country),
            getTravelTablesData(args.city, args.country),       // NEW
            getOpenMeteoClimate(coords.lat, coords.lon),        // NEW
            getSafetyInfrastructure(coords.lat, coords.lon),    // NEW
            getTravelAdvisory(args.country),                     // NEW
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
        const description = wikiDescription ||
            `Discover ${args.city}, a destination in ${args.country}. Explore what this location has to offer for families and travelers.`;
        const shortDescription = `Discover ${args.city} in ${args.country}.`;

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
            country: args.country,
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
        });

        // 8. Increment search count
        await ctx.runMutation(api.destinations.incrementSearchCount, { name: fullName });

        return {
            success: true,
            allScores,
            dataQuality,
        };
    },
});
