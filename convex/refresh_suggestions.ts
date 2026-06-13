// @ts-nocheck -- Convex actions have circular type deps with generated api; checked by convex dev
import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getFamilySuggestions, getNeighborhoods } from "./lib/api_clients";
import { searchFamilyVenues } from "./lib/foursquare";

// ---------------------------------------------------------------------------
// REFRESH SUGGESTIONS & NEIGHBORHOODS (for existing destinations)
// ---------------------------------------------------------------------------

// Mutation defined BEFORE the action to avoid circular type inference
export const patchSuggestions = mutation({
    args: {
        name: v.string(),
        suggestions: v.object({
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
        }),
        neighborhoods: v.array(v.object({
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
        })),
    },
    handler: async (ctx, args) => {
        const destination = await ctx.db
            .query("destinations")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (!destination) {
            return { success: false, error: "Destination not found" };
        }

        await ctx.db.patch(destination._id, {
            suggestions: args.suggestions,
            neighborhoods: args.neighborhoods,
            lastUpdated: Date.now(),
        });

        return { success: true };
    },
});

async function withRetry<T>(
    fn: () => Promise<T>,
    label: string,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.log(`[Retry] ${label} attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
            }
            return await fn();
        } catch (e: any) {
            if (attempt === maxRetries) {
                console.error(`[Retry] ${label} failed all ${maxRetries + 1} attempts:`, e.message || e);
                throw e;
            }
            console.warn(`[Retry] ${label} attempt ${attempt + 1} failed:`, e.message || e);
        }
    }
    throw new Error(`Unreachable: ${label}`);
}

export const refreshSuggestions = action({
    args: {
        destinationName: v.string(),
    },
    handler: async (ctx, args) => {
        const destination = await ctx.runQuery(api.destinations.getDestination, {
            name: args.destinationName,
        });

        if (!destination) {
            return { success: false, error: `Destination not found: ${args.destinationName}` };
        }

        const coords = destination.coordinates;
        console.log(`[refreshSuggestions] Refreshing for ${args.destinationName} at ${coords.lat},${coords.lon}`);

        const fetchOverpassSuggestions = async () => {
            let overpassSuggestions: { freeActivities: any[]; downtime: any[]; cafes: any[]; restaurants: any[] } = { freeActivities: [], downtime: [], cafes: [], restaurants: [] };
            for (let attempt = 0; attempt < 2; attempt++) {
                if (attempt > 0) {
                    const delay = 1500;
                    console.log(`[refreshSuggestions] Overpass retry ${attempt + 1}/2 after ${delay}ms delay`);
                    await new Promise(r => setTimeout(r, delay));
                }
                const result = await getFamilySuggestions(coords.lat, coords.lon, 3000);
                const hasData = result.freeActivities.length > 0 || result.cafes.length > 0 || result.downtime.length > 0 || result.restaurants.length > 0;
                if (hasData) {
                    overpassSuggestions = result;
                    console.log(`[refreshSuggestions] Overpass attempt ${attempt + 1} succeeded with ${result.freeActivities.length} activities`);
                    break;
                }
                console.warn(`[refreshSuggestions] Overpass attempt ${attempt + 1} returned empty`);
            }
            return overpassSuggestions;
        };

        const fetchNeighborhoods = async () => {
            let neighborhoods: any[] = [];
            const cityName = args.destinationName.split(',')[0].trim();
            for (let attempt = 0; attempt < 2; attempt++) {
                if (attempt > 0) {
                    const delay = 1500;
                    console.log(`[refreshSuggestions] Neighborhoods retry ${attempt + 1}/2 after ${delay}ms delay`);
                    await new Promise(r => setTimeout(r, delay));
                }
                const result = await getNeighborhoods(coords.lat, coords.lon, cityName);
                if (result.length > 0) {
                    neighborhoods = result;
                    console.log(`[refreshSuggestions] Neighborhoods attempt ${attempt + 1} succeeded with ${result.length} hoods`);
                    break;
                }
                console.warn(`[refreshSuggestions] Neighborhoods attempt ${attempt + 1} returned empty`);
            }
            return neighborhoods;
        };

        // Fetch independent APIs concurrently to keep the full-page loading phase short.
        const [foursquareData, overpassSuggestions, neighborhoods] = await Promise.all([
            withRetry(
                () => searchFamilyVenues(coords.lat, coords.lon, "both", 20),
                "Foursquare venues", 1, 1000
            ),
            fetchOverpassSuggestions(),
            fetchNeighborhoods(),
        ]);

        const mergedSuggestions = {
            freeActivities: overpassSuggestions.freeActivities.slice(0, 8),
            downtime: overpassSuggestions.downtime.length > 0
                ? overpassSuggestions.downtime.slice(0, 6)
                : overpassSuggestions.freeActivities.filter((a: any) =>
                    a.type === 'garden' || a.type === 'library'
                ).slice(0, 6),
            cafes: foursquareData.success
                ? foursquareData.venues
                    .filter(v => v.categories.some(c =>
                        c.toLowerCase().includes('cafe') || c.toLowerCase().includes('coffee')))
                    .map(v => ({
                        name: v.name, address: v.address, rating: v.rating,
                        priceLevel: v.priceLevel, kidFeatures: v.kidFeatures,
                        cuisine: v.cuisine, hours: v.hours, tips: v.tips,
                    })).slice(0, 8)
                : overpassSuggestions.cafes.slice(0, 8),
            restaurants: foursquareData.success
                ? foursquareData.venues
                    .filter(v => v.categories.some(c =>
                        c.toLowerCase().includes('restaurant')))
                    .map(v => ({
                        name: v.name, address: v.address, rating: v.rating,
                        priceLevel: v.priceLevel, kidFeatures: v.kidFeatures,
                        cuisine: v.cuisine, hours: v.hours, tips: v.tips,
                    })).slice(0, 8)
                : overpassSuggestions.restaurants.slice(0, 8),
        };

        await ctx.runMutation(api.refresh_suggestions.patchSuggestions, {
            name: args.destinationName,
            suggestions: mergedSuggestions,
            neighborhoods: neighborhoods.slice(0, 10),
        });

        console.log(`[refreshSuggestions] Done — ${mergedSuggestions.freeActivities.length} activities, ${mergedSuggestions.downtime.length} downtime, ${mergedSuggestions.cafes.length} cafes, ${mergedSuggestions.restaurants.length} restaurants, ${neighborhoods.length} neighborhoods`);

        return {
            success: true,
            counts: {
                freeActivities: mergedSuggestions.freeActivities.length,
                downtime: mergedSuggestions.downtime.length,
                cafes: mergedSuggestions.cafes.length,
                restaurants: mergedSuggestions.restaurants.length,
                neighborhoods: neighborhoods.length,
            },
            usedFoursquare: foursquareData.success,
            usedOverpass: overpassSuggestions.freeActivities.length > 0 || overpassSuggestions.cafes.length > 0,
        };
    },
});
