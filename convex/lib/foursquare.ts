/**
 * Foursquare Places API Integration
 * 
 * Free tier: 100,000 requests/month
 * Docs: https://docs.foursquare.com/developer/reference/place-search
 * 
 * Why Foursquare:
 * - Has explicit `good_for_kids`, `high_chair`, `changing_table` tags
 * - Rich venue details (hours, price level, tips from real users)
 * - Generous free tier vs Google Places
 */

export interface FoursquareVenue {
    id: string;
    name: string;
    address: string;
    rating?: number;
    priceLevel?: string;       // "$", "$$", "$$$"
    kidFeatures: string[];     // ["high_chair", "play_area", "changing_table", "kids_menu"]
    cuisine?: string;
    hours?: string;
    latitude: number;
    longitude: number;
    distance: number;          // meters from search center
    categories: string[];
    tips?: string;             // user-generated tips
}

export interface FoursquareSearchResult {
    venues: FoursquareVenue[];
    success: boolean;
    error?: string;
}

/**
 * Search for kid-friendly venues near a location
 * @param lat Latitude
 * @param lon Longitude
 * @param category Category to search: "cafe" | "restaurant" | "both"
 * @param limit Max results (default 20)
 */
export async function searchFamilyVenues(
    lat: number,
    lon: number,
    category: "cafe" | "restaurant" | "both" = "both",
    limit = 20
): Promise<FoursquareSearchResult> {
    const apiKey = process.env.FOURSQUARE_API_KEY;

    if (!apiKey) {
        console.warn("FOURSQUARE_API_KEY not configured - venue search skipped");
        return { venues: [], success: false, error: "No API key" };
    }

    try {
        // Foursquare category IDs:
        // 13032 = Coffee Shop, 13033 = Café
        // 13065 = Restaurant (all types)
        let categoryIds: string;
        if (category === "cafe") {
            categoryIds = "13032,13033";
        } else if (category === "restaurant") {
            categoryIds = "13065";
        } else {
            categoryIds = "13032,13033,13065";
        }

        const url = `https://api.foursquare.com/v3/places/search` +
            `?ll=${lat},${lon}` +
            `&radius=3000` +
            `&categories=${categoryIds}` +
            `&limit=${limit}` +
            `&sort=DISTANCE`;

        const res = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "Authorization": apiKey,
            },
        });

        if (!res.ok) {
            console.error(`Foursquare API error: ${res.status} ${await res.text()}`);
            return { venues: [], success: false, error: `HTTP ${res.status}` };
        }

        const data = await res.json();
        const results = data.results || [];

        const venues: FoursquareVenue[] = results.map((place: any) => {
            const kidFeatures: string[] = [];

            // Check attributes for kid-friendly features
            const attrs = place.attributes || {};
            if (attrs.high_chair) kidFeatures.push("high_chair");
            if (attrs.changing_table) kidFeatures.push("changing_table");
            if (attrs.kids_menu) kidFeatures.push("kids_menu");
            if (attrs.outdoor_seating) kidFeatures.push("outdoor_seating");
            if (attrs.play_area) kidFeatures.push("play_area");

            // Parse price level
            let priceLevel: string | undefined;
            if (place.price_level) {
                priceLevel = "$".repeat(place.price_level);
            }

            // Get first tip if available
            const tips = place.tips?.[0]?.text;

            return {
                id: place.fsq_id,
                name: place.name,
                address: place.location?.formatted_address || place.location?.address || "",
                rating: place.rating,
                priceLevel,
                kidFeatures,
                cuisine: place.categories?.[0]?.name,
                hours: place.hours?.display,
                latitude: place.geocodes?.main?.latitude || lat,
                longitude: place.geocodes?.main?.longitude || lon,
                distance: place.distance || 0,
                categories: (place.categories || []).map((c: any) => c.name),
                tips,
            };
        });

        return { venues, success: true };
    } catch (e) {
        console.error("Foursquare search error:", e);
        return { venues: [], success: false, error: String(e) };
    }
}

/**
 * Get detailed venue info including tips and photos
 */
export async function getVenueDetails(fsqId: string): Promise<FoursquareVenue | null> {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://api.foursquare.com/v3/places/${fsqId}` +
            `?fields=name,location,rating,price,hours,tips,photos,attributes,categories`;

        const res = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "Authorization": apiKey,
            },
        });

        if (!res.ok) return null;

        const place = await res.json();

        const kidFeatures: string[] = [];
        const attrs = place.attributes || {};
        if (attrs.high_chair) kidFeatures.push("high_chair");
        if (attrs.changing_table) kidFeatures.push("changing_table");
        if (attrs.kids_menu) kidFeatures.push("kids_menu");
        if (attrs.outdoor_seating) kidFeatures.push("outdoor_seating");
        if (attrs.play_area) kidFeatures.push("play_area");

        return {
            id: place.fsq_id,
            name: place.name,
            address: place.location?.formatted_address || "",
            rating: place.rating,
            priceLevel: place.price ? "$".repeat(place.price) : undefined,
            kidFeatures,
            cuisine: place.categories?.[0]?.name,
            hours: place.hours?.display,
            latitude: place.geocodes?.main?.latitude || 0,
            longitude: place.geocodes?.main?.longitude || 0,
            distance: 0,
            categories: (place.categories || []).map((c: any) => c.name),
            tips: place.tips?.[0]?.text,
        };
    } catch (e) {
        console.error("Foursquare venue details error:", e);
        return null;
    }
}
