import { KNOWN_DESTINATIONS } from "./viator_destinations";

/**
 * Viator Partner API Integration (v2 format)
 * 
 * API Documentation: https://docs.viator.com/partner-api/merchant/technical/
 * 
 * SANDBOX vs PRODUCTION:
 * - Sandbox: https://api.sandbox.viator.com/partner (test data, no real bookings)
 * - Production: https://api.viator.com/partner (real data, real bookings)
 * 
 * To switch to production:
 * 1. Get a production API key from Viator Partner Portal
 * 2. Set VIATOR_USE_PRODUCTION=true in Convex environment
 * 3. Set VIATOR_API_KEY to your production key
 */

export const VIATOR_SANDBOX_URL = "https://api.sandbox.viator.com/partner";
export const VIATOR_PRODUCTION_URL = "https://api.viator.com/partner";

function getViatorBaseUrl(): string {
    const useProduction = process.env.VIATOR_USE_PRODUCTION === "true";
    const url = useProduction ? VIATOR_PRODUCTION_URL : VIATOR_SANDBOX_URL;
    console.log(`[Viator] Using ${useProduction ? "PRODUCTION" : "SANDBOX"} endpoint: ${url}`);
    return url;
}

/**
 * Headers for Viator API requests (v2 format requires Accept header with version)
 */
function getHeaders() {
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) {
        const msg = "VIATOR_API_KEY is not set in Convex environment variables. Activities will not load. Set it via: npx convex env set VIATOR_API_KEY your_key";
        console.error(`[Viator] ${msg}`);
        throw new Error(msg);
    }

    return {
        "exp-api-key": apiKey,
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
        "Accept": "application/json;version=2.0",
    };
}

/**
 * Known destination IDs for common cities
 * These are cached to avoid API calls for destination lookup
 * IDs sourced from Viator /taxonomy/destinations endpoint
 */
// KNOWN_DESTINATIONS moved to ./viator_destinations.ts

/**
 * Get Viator destination ID by city name
 * First checks the cache of known destinations
 * @param query City name (e.g., "Barcelona" or "New York")
 */
export async function getViatorDestinationId(query: string): Promise<number | null> {
    const normalizedQuery = query.toLowerCase().trim();

    // Check cache first - exact match
    if (KNOWN_DESTINATIONS[normalizedQuery]) {
        console.log(`Found cached destination ID: ${KNOWN_DESTINATIONS[normalizedQuery]} for ${query}`);
        return KNOWN_DESTINATIONS[normalizedQuery];
    }

    // Try partial match on cache (e.g., "Barcelona, Spain" -> "barcelona")
    for (const [city, id] of Object.entries(KNOWN_DESTINATIONS)) {
        if (normalizedQuery.includes(city) || city.includes(normalizedQuery)) {
            console.log(`Found cached destination ID (partial): ${id} for ${query} -> ${city}`);
            return id;
        }
    }

    console.log(`No cached destination ID found for: ${query}`);
    return null;
}

/**
 * Search products for a specific destination using v2 API format
 * POST /products/search
 * @param destinationId Viator Destination ID
 * @param tags Optional tag IDs to filter (e.g., 21972 for Family Friendly)
 */
export async function searchViatorProducts(destinationId: number, tags: number[] = []) {
    try {
        const requestBody: {
            filtering: { destination: string; tags?: number[] };
            pagination: { start: number; count: number };
            currency: string;
        } = {
            filtering: {
                destination: destinationId.toString(),
            },
            pagination: {
                start: 1,
                count: 12
            },
            currency: "USD"
        };

        // Add tags filter if provided
        if (tags.length > 0) {
            requestBody.filtering.tags = tags;
        }

        const baseUrl = getViatorBaseUrl();
        const response = await fetch(`${baseUrl}/products/search`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Viator] Product search HTTP ${response.status} failed for dest ${destinationId}:`, errorText.substring(0, 500));
            return [];
        }

        const data = await response.json();
        const products = data.products || [];
        console.log(`[Viator] Found ${products.length} products for destination ${destinationId}`);
        return products;

    } catch (error: any) {
        console.error(`[Viator] Fatal error fetching products for dest ${destinationId}:`, error.message || error);
        return [];
    }
}
