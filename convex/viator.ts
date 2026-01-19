import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
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

export const fetchActivities = action({
    args: {
        destinationName: v.string(), // "City, Country" or just "City"
    },
    handler: async (ctx, args) => {
        // 1. Get the destination from DB to check if we already have an ID
        const destination = await ctx.runQuery(api.destinations.getDestination, { name: args.destinationName });

        if (!destination) {
            console.error(`Destination not found: ${args.destinationName}`);
            return [];
        }

        let viatorId = destination.viatorDestinationId;

        // 2. If ID is missing, look it up
        if (!viatorId) {
            console.log(`Looking up Viator ID for ${args.destinationName}...`);
            // Split "City, Country" -> "City" for better search results
            const query = args.destinationName.split(',')[0];
            const foundId = await getViatorDestinationId(query);

            if (foundId) {
                console.log(`Found Viator ID: ${foundId}`);
                viatorId = foundId;
                // Save it for next time
                await ctx.runMutation(internal.viator.saveViatorId, {
                    id: destination._id,
                    viatorDestinationId: foundId,
                });
            } else {
                console.log(`Could not find Viator ID for ${args.destinationName}`);
                return [];
            }
        }

        // 3. Search for products
        // Standard Family categories: 
        // 21972 = Family-friendly
        // 12057 = Kid Friendly
        // We'll search without tags first to ensure results in sandbox, or try one.
        // Sandbox data is limited.
        console.log(`Searching products for ID: ${viatorId}`);
        const products = await searchViatorProducts(viatorId);

        // 4. Map to our format
        return products.map((p: any) => ({
            id: p.productCode,
            title: p.title,
            image: p.images?.[0]?.variants?.find((v: any) => v.width >= 400)?.url || p.images?.[0]?.url,
            price: p.pricing?.summary?.fromPrice || 0,
            rating: p.reviews?.combinedAverageRating || 0,
            reviews: p.reviews?.totalReviews || 0,
            ageRange: "Family Friendly", // Metadata not always avail in search list
            duration: p.duration?.fixedDurationInMinutes ? `${p.duration.fixedDurationInMinutes} mins` : "Flexible",
            productUrl: p.productUrl,
        }));
    },
});
