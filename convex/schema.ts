import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    destinations: defineTable({
        name: v.string(),
        country: v.string(),
        coordinates: v.object({
            lat: v.number(),
            lon: v.number(),
        }),

        // Expanded scores with new metrics
        allScores: v.object({
            safety: v.number(),
            playgrounds: v.number(),
            sidewalks: v.number(),
            kidActivities: v.number(),
            healthyFood: v.number(),
            strollerFriendly: v.number(),
            accessibility: v.number(),
            weatherComfort: v.optional(v.number()),      // NEW (optional for migration)
            costAffordability: v.optional(v.number()),   // NEW (optional for migration)
            familyScore: v.optional(v.number()), // nullable when data incomplete
        }),

        // Raw API data (for transparency and debugging)
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

        // Data quality tracking
        dataQuality: v.optional(v.object({
            completedMetrics: v.array(v.string()),
            missingMetrics: v.array(v.string()),
            completenessScore: v.number(),
            hasReliableOverallScore: v.boolean(),
        })),

        // Popularity tracking for tiered refresh
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
        lastUpdated: v.number(),
    })
        .index("by_name", ["name"])
        .index("by_last_updated", ["lastUpdated"]),
});
