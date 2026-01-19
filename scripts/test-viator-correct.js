
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VIATOR_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.VIATOR_API_KEY;

console.log(`Using API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT FOUND'}`);

const BASE_URL = "https://api.sandbox.viator.com/partner";

function getHeaders() {
    return {
        "exp-api-key": API_KEY,
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
        "Accept": "application/json;version=2.0",
    };
}

async function fetchAllDestinations() {
    console.log("\n1. Fetching all destinations via GET /taxonomy/destinations...");

    const res = await fetch(`${BASE_URL}/taxonomy/destinations`, {
        method: "GET",
        headers: getHeaders(),
    });

    console.log(`Response status: ${res.status}`);

    if (res.status !== 200) {
        console.log("Error:", await res.text());
        return null;
    }

    const data = await res.json();
    console.log(`Found ${data.data?.length || 0} destinations`);
    return data.data || [];
}

async function findDestinationId(destinations, query) {
    console.log(`\n2. Searching for destination: "${query}"`);

    const normalizedQuery = query.toLowerCase().trim();

    // Exact match first
    let match = destinations.find(d => d.destinationName.toLowerCase() === normalizedQuery);

    if (!match) {
        // Partial match
        match = destinations.find(d =>
            d.destinationName.toLowerCase().includes(normalizedQuery) ||
            normalizedQuery.includes(d.destinationName.toLowerCase())
        );
    }

    if (match) {
        console.log(`Found: ${match.destinationName} (ID: ${match.destinationId}, Type: ${match.destinationType})`);
        return match.destinationId;
    }

    console.log("No match found");
    return null;
}

async function searchProducts(destinationId) {
    console.log(`\n3. Searching products for destination ID: ${destinationId}`);

    const res = await fetch(`${BASE_URL}/products/search`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            filtering: {
                destination: destinationId.toString(),
            },
            sorting: {
                sort: "TOP_SELLERS",
                order: "DESCENDING"
            },
            pagination: {
                start: 1,
                count: 8
            },
            currency: "USD"
        })
    });

    console.log(`Response status: ${res.status}`);

    if (res.status !== 200) {
        console.log("Error:", await res.text());
        return [];
    }

    const data = await res.json();
    console.log(`Found ${data.products?.length || 0} products`);

    if (data.products?.length > 0) {
        console.log("\nSample Products:");
        data.products.slice(0, 3).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.title}`);
            console.log(`     Price: $${p.pricing?.summary?.fromPrice || 'N/A'}`);
            console.log(`     Rating: ${p.reviews?.combinedAverageRating || 'N/A'} (${p.reviews?.totalReviews || 0} reviews)`);
        });
    }

    return data.products || [];
}

(async () => {
    try {
        // Step 1: Fetch all destinations
        const destinations = await fetchAllDestinations();
        if (!destinations) {
            console.log("Failed to fetch destinations");
            return;
        }

        // Step 2: Find Barcelona
        const destId = await findDestinationId(destinations, "Barcelona");

        if (destId) {
            // Step 3: Search products
            await searchProducts(destId);
        }

    } catch (e) {
        console.error("Exception:", e);
    }
})();
