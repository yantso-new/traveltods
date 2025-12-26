import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Staleness threshold: 90 days in milliseconds
const STALE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000;

// Check if a destination's data is stale
function isStale(lastUpdated: number): boolean {
    return Date.now() - lastUpdated > STALE_THRESHOLD_MS;
}

// Helper to refresh a single destination
async function refreshDestination(ctx: any, dest: any) {
    const [city, country] = dest.name.split(',').map((s: string) => s.trim());

    await ctx.runAction(api.destinations.gatherDestination, {
        city: city || dest.name,
        country: country || dest.country || "Unknown"
    });
}

/**
 * TIER 1: Refresh top 100 popular destinations (proactive)
 * Called by quarterly cron job
 */
async function refreshTop100Handler(ctx: any) {
    // First update the top 100 flags
    await ctx.runMutation(internal.destinations.updateTop100Flags);

    // Get top 100 destinations
    const top100 = await ctx.runQuery(api.destinations.getTop100Destinations);

    console.log(`Starting quarterly refresh for ${top100.length} top destinations...`);

    let successCount = 0;
    let failCount = 0;

    for (const dest of top100) {
        try {
            console.log(`Refreshing top destination: ${dest.name}`);
            const fullDest = await ctx.runQuery(api.destinations.getDestination, { name: dest.name });

            if (fullDest) {
                await refreshDestination(ctx, fullDest);
                successCount++;
            }

            // Rate limit: 2 seconds between API calls
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`Failed to refresh ${dest.name}:`, e);
            failCount++;
        }
    }

    console.log(`Top 100 refresh complete. Success: ${successCount}, Failed: ${failCount}`);
    return { success: true, successCount, failCount };
}

/**
 * TIER 2: Check and refresh if stale (lazy, on-demand)
 * Called when a user views a destination
 */
export const checkAndRefreshIfStale = action({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const destination = await ctx.runQuery(api.destinations.getDestination, { name: args.name });

        if (!destination) {
            // New destination - will be gathered by gatherDestination
            return { needsRefresh: true, reason: "new_destination" };
        }

        // Top 100 destinations are refreshed quarterly automatically
        if (destination.popularity?.isTop100) {
            return { needsRefresh: false, reason: "top_100_auto_refresh" };
        }

        // Check staleness for non-top destinations
        if (isStale(destination.lastUpdated)) {
            console.log(`Destination ${args.name} is stale (last updated: ${new Date(destination.lastUpdated).toISOString()}), triggering lazy refresh`);

            const [city, country] = args.name.split(',').map((s: string) => s.trim());

            await ctx.runAction(api.destinations.gatherDestination, {
                city: city || args.name,
                country: country || destination.country || "Unknown"
            });

            return { needsRefresh: true, reason: "stale_data_refreshed" };
        }

        return { needsRefresh: false, reason: "data_fresh" };
    },
});

/**
 * Internal action for quarterly cron (top 100 only)
 */
export const refreshTop100DestinationsInternal = internalAction({
    args: {},
    handler: async (ctx) => {
        // Check if this is a quarterly month (Jan=0, Apr=3, Jul=6, Oct=9)
        const month = new Date().getMonth();
        if (![0, 3, 6, 9].includes(month)) {
            console.log(`Skipping top 100 refresh - not a quarterly month (current month: ${month})`);
            return { skipped: true, month };
        }

        console.log(`Running quarterly top 100 refresh (month: ${month})`);
        return refreshTop100Handler(ctx);
    },
});

/**
 * Manual refresh for all destinations (admin function)
 */
export const refreshAllDestinations = action({
    args: {},
    handler: async (ctx) => {
        const destinations = await ctx.runQuery(api.destinations.getAllDestinations);
        console.log(`Starting manual refresh for ${destinations.length} destinations...`);

        let successCount = 0;
        let failCount = 0;

        for (const dest of destinations) {
            try {
                console.log(`Refreshing ${dest.name}...`);
                await refreshDestination(ctx, dest);
                successCount++;

                // Rate limit: 2 seconds between API calls
                await new Promise(r => setTimeout(r, 2000));
            } catch (e) {
                console.error(`Failed to refresh ${dest.name}:`, e);
                failCount++;
            }
        }

        console.log(`Manual refresh complete. Success: ${successCount}, Failed: ${failCount}`);
        return { success: true, successCount, failCount };
    },
});

/**
 * Manual refresh for top 100 only (admin function)
 */
export const refreshTop100Destinations = action({
    args: {},
    handler: async (ctx) => {
        return refreshTop100Handler(ctx);
    },
});

// Keep the old internal action for backwards compatibility with existing cron
export const refreshAllDestinationsInternal = internalAction({
    args: {},
    handler: async (ctx) => {
        // Redirect to top 100 refresh for efficiency
        const month = new Date().getMonth();
        if (![0, 3, 6, 9].includes(month)) {
            console.log(`Skipping refresh - not a quarterly month (current month: ${month})`);
            return { skipped: true, month };
        }

        console.log(`Running quarterly refresh (redirecting to top 100)`);
        return refreshTop100Handler(ctx);
    },
});
