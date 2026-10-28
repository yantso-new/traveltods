import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getViatorDestinationId, searchViatorProducts } from "./lib/viator";

// Internal mutation to save the found ID
export const saveViatorId = internalMutation({
    args: {
        id: v.id("destinations"),
        viatorDestinationId: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            viatorDestinationId: args.viatorDestinationId,
            lastUpdated: Date.now(),
        });
    },
});

// Cached activities are served for 24h. Empty results (which also cover upstream
// failures, since searchViatorProducts swallows errors) are only cached for 1h.
const ACTIVITY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const EMPTY_ACTIVITY_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_DESTINATION_NAME_LENGTH = 200;

export const getCachedActivities = internalQuery({
    args: { destinationId: v.id("destinations") },
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query("viatorActivityCache")
            .withIndex("by_destination", (q) => q.eq("destinationId", args.destinationId))
            .first();
        if (!cached) return null;

        const ttl = cached.activities.length > 0 ? ACTIVITY_CACHE_TTL_MS : EMPTY_ACTIVITY_CACHE_TTL_MS;
        if (Date.now() - cached.fetchedAt > ttl) return null;
        return cached.activities;
    },
});

export const saveCachedActivities = internalMutation({
    args: {
        destinationId: v.id("destinations"),
        activities: v.array(v.any()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("viatorActivityCache")
            .withIndex("by_destination", (q) => q.eq("destinationId", args.destinationId))
            .first();
        const row = { activities: args.activities, fetchedAt: Date.now() };
        if (existing) {
            await ctx.db.patch(existing._id, row);
        } else {
            await ctx.db.insert("viatorActivityCache", { destinationId: args.destinationId, ...row });
        }
    },
});

// Public on purpose (the destination page calls it), so it must stay cheap to abuse:
// it only runs for destinations that already exist, never creates rows, and serves
// cached results for 24h before calling Viator again.
export const fetchActivities = action({
    args: {
        destinationName: v.string(), // "City, Country" or just "City"
    },
    handler: async (ctx, args): Promise<any[]> => {
        if (args.destinationName.length > MAX_DESTINATION_NAME_LENGTH) {
            return [];
        }
        console.log(`[Viator Action] fetchActivities called for: ${args.destinationName}`);

        // 1. Get the destination from DB to check if we already have an ID
        const destination = await ctx.runQuery(api.destinations.getDestination, { name: args.destinationName });

        if (!destination) {
            console.error(`[Viator Action] Destination not found in DB: ${args.destinationName}`);
            return [];
        }

        const cachedActivities: any[] | null = await ctx.runQuery(internal.viator.getCachedActivities, {
            destinationId: destination._id,
        });
        if (cachedActivities) {
            console.log(`[Viator Action] Serving ${cachedActivities.length} cached activities for ${destination.name}`);
            return cachedActivities;
        }

        console.log(`[Viator Action] Found destination DB record: ${destination.name}, stored viatorId: ${destination.viatorDestinationId ?? "none"}`);


        // 2. Always look up the ID to ensure we use the latest mapping (fixes stale IDs)
        const query = args.destinationName.split(',')[0];
        console.log(`[Viator Action] Looking up Viator ID for query: "${query}"`);
        const foundId = await getViatorDestinationId(query);

        let viatorId = destination.viatorDestinationId;

        if (foundId) {
            console.log(`[Viator Action] Found Viator ID: ${foundId}`);
            if (viatorId !== foundId) {
                console.log(`[Viator Action] Updating stored ID from ${viatorId} to ${foundId}`);
                viatorId = foundId;
                await ctx.runMutation(internal.viator.saveViatorId, {
                    id: destination._id,
                    viatorDestinationId: foundId,
                });
            }
        } else if (!viatorId) {
            console.error(`[Viator Action] Could not find Viator ID for "${args.destinationName}" (query: "${query}")`);
            return [];
        } else {
            console.log(`[Viator Action] No cached lookup match, falling back to stored ID: ${viatorId}`);
        }

        // 3. Search for products
        console.log(`[Viator Action] Searching products for Viator destination ID: ${viatorId}`);
        const products = await searchViatorProducts(viatorId);
        console.log(`[Viator Action] Mapped ${products.length} products for ${args.destinationName}`);

        // 4. Map to our format (handles both v1 and v2 API response formats)
        const activities = products.map((p: any) => ({
            id: p.productCode || p.code,
            title: p.title || p.name,
            // v1 uses thumbnailURL, v2 uses images array
            image: p.thumbnailURL || p.thumbnailHiResURL || p.images?.[0]?.variants?.find((v: any) => v.width >= 400)?.url || p.images?.[0]?.url,
            // v1 uses priceFrom, v2 uses pricing.summary.fromPrice
            price: p.priceFrom || p.price || p.pricing?.summary?.fromPrice || 0,
            // v1 uses rating directly, v2 uses reviews.combinedAverageRating
            rating: p.rating || p.reviews?.combinedAverageRating || 0,
            // v1 uses reviewCount, v2 uses reviews.totalReviews
            reviews: p.reviewCount || p.reviews?.totalReviews || 0,
            ageRange: "Family Friendly",
            // v1 uses durationRange, v2 uses duration object
            duration: (p.duration?.fixedDurationInMinutes
                ? (p.duration.fixedDurationInMinutes >= 60
                    ? `${Math.floor(p.duration.fixedDurationInMinutes / 60)}h ${p.duration.fixedDurationInMinutes % 60 > 0 ? `${p.duration.fixedDurationInMinutes % 60}m` : ''}`
                    : `${p.duration.fixedDurationInMinutes}m`)
                : (typeof p.duration === 'string' ? p.duration : (p.durationRange || "Flexible"))),
            // v1 uses webURL, v2 uses productUrl
            productUrl: p.webURL || p.productUrl || `https://www.viator.com/tours/${p.productCode || p.code}`,
            // Include badge if available
            badge: p.specialOfferAvailable ? "Special Offer" : undefined,
        }));

        await ctx.runMutation(internal.viator.saveCachedActivities, {
            destinationId: destination._id,
            activities,
        });
        return activities;
    },
});
