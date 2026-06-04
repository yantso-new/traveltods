import { v } from "convex/values";
import { action } from "./_generated/server";
import { getNeighborhoods, getFamilySuggestions } from "./lib/api_clients";
import { searchFamilyVenues } from "./lib/foursquare";

/**
 * Test action to debug neighborhood and suggestion data fetching
 */
export const testDestinationData = action({
  args: {
    lat: v.number(),
    lon: v.number(),
    cityName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`\n=== Testing data for ${args.cityName} (${args.lat}, ${args.lon}) ===\n`);

    // Test neighborhoods
    console.log("1. Fetching neighborhoods...");
    const neighborhoods = await getNeighborhoods(args.lat, args.lon, args.cityName);
    console.log(`   Found ${neighborhoods.length} neighborhoods`);
    if (neighborhoods.length > 0) {
      console.log("   Sample neighborhoods:");
      neighborhoods.slice(0, 3).forEach(n => {
        console.log(`     - ${n.name}: ${n.tag || 'no tag'}`);
      });
    }

    // Test family suggestions
    console.log("\n2. Fetching family suggestions...");
    const suggestions = await getFamilySuggestions(args.lat, args.lon);
    console.log(`   Free activities: ${suggestions.freeActivities.length}`);
    console.log(`   Cafes: ${suggestions.cafes.length}`);
    console.log(`   Restaurants: ${suggestions.restaurants.length}`);
    console.log(`   Downtime: ${suggestions.downtime.length}`);
    
    if (suggestions.freeActivities.length > 0) {
      console.log("   Sample free activities:");
      suggestions.freeActivities.slice(0, 3).forEach(a => {
        console.log(`     - ${a.name} (${a.type})`);
      });
    }

    // Test Foursquare venues
    console.log("\n3. Fetching Foursquare venues...");
    const venuesResult = await searchFamilyVenues(args.lat, args.lon);
    const venues = venuesResult.venues || [];
    console.log(`   Found ${venues.length} venues`);
    if (venues.length > 0) {
      console.log("   Sample venues:");
      venues.slice(0, 3).forEach((v: any) => {
        console.log(`     - ${v.name}: ${v.categories?.join(', ') || 'no categories'}`);
      });
    }

    return {
      neighborhoods: neighborhoods.length,
      suggestions: {
        freeActivities: suggestions.freeActivities.length,
        cafes: suggestions.cafes.length,
        restaurants: suggestions.restaurants.length,
        downtime: suggestions.downtime.length,
      },
      venues: venues.length,
    };
  },
});
