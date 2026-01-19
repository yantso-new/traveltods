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


        // 2. Always look up the ID to ensure we use the latest mapping (fixes stale IDs)
        console.log(`Looking up Viator ID for ${args.destinationName}...`);
        const query = args.destinationName.split(',')[0];
        const foundId = await getViatorDestinationId(query);

        let viatorId = destination.viatorDestinationId;

        if (foundId) {
            console.log(`Found Viator ID: ${foundId}`);
            if (viatorId !== foundId) {
                console.log(`Updating stored ID from ${viatorId} to ${foundId}`);
                viatorId = foundId;
                await ctx.runMutation(internal.viator.saveViatorId, {
                    id: destination._id,
                    viatorDestinationId: foundId,
                });
            }
        } else if (!viatorId) {
            console.log(`Could not find Viator ID for ${args.destinationName}`);
            return [];
        }

        // 3. Search for products
        // Standard Family categories: 
        // 21972 = Family-friendly
        // 12057 = Kid Friendly
        // We'll search without tags first to ensure results in sandbox, or try one.
        // Sandbox data is limited.
        console.log(`Searching products for ID: ${viatorId}`);
        const products = await searchViatorProducts(viatorId);

        // 4. Map to our format (handles both v1 and v2 API response formats)
        return products.map((p: any) => ({
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
    },
});
