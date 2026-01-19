
export const VIATOR_BASE_URL = "https://api.sandbox.viator.com/partner";

/**
 * Headers for Viator API requests
 */
function getHeaders() {
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) {
        throw new Error("VIATOR_API_KEY is not set");
    }

    return {
        "exp-api-key": apiKey,
        "Accept-Language": "en-US",
        "Currency-Code": "USD",
        "Content-Type": "application/json",
        "Accept": "application/json;version=2.0",
    };
}

/**
 * Search for a destination ID by text query
 * @param query City/Location name
 */
export async function getViatorDestinationId(query: string): Promise<number | null> {
    // Use v1 search/freetext to find destination
    // Note: v2 might have better endpoints but v1 /search/freetext is reliable for getting destination IDs
    try {
        const response = await fetch(`${VIATOR_BASE_URL}/search/freetext`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                searchTerm: query,
                searchTypes: [{ searchType: "DESTINATIONS" }],
                pagination: { start: 1, count: 3 },
                currency: "USD"
            })
        });

        if (!response.ok) {
            console.error("Viator search failed:", await response.text());
            return null;
        }

        const data = await response.json();
        const destinations = data.data;

        if (destinations && destinations.length > 0) {
            // Find the first destination result
            const dest = destinations.find((d: any) => d.resultType === "DESTINATION");
            return dest ? dest.data.destinationId : null;
        }
        return null;

    } catch (error) {
        console.error("Error fetching Viator destination:", error);
        return null;
    }
}

/**
 * Search products for a specific destination
 * @param destinationId Viator Destination ID
 * @param tags Optional tags to filter (e.g. 21972 for Family Friendly)
 */
export async function searchViatorProducts(destinationId: number, tags: number[] = []) {
    try {
        // Sandbox only has limited products, but we'll try searching
        const response = await fetch(`${VIATOR_BASE_URL}/products/search`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                filtering: {
                    destination: destinationId.toString(),
                    tags: tags.length > 0 ? tags : undefined,
                },
                sorting: {
                    sort: "TOP_SELLERS",
                    order: "DESCENDING"
                },
                pagination: {
                    start: 1,
                    count: 12
                },
                currency: "USD"
            })
        });

        if (!response.ok) {
            console.error("Viator product search failed:", await response.text());
            return [];
        }

        const data = await response.json();
        return data.products || [];

    } catch (error) {
        console.error("Error fetching Viator products:", error);
        return [];
    }
}
