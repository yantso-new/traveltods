
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VIATOR_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.VIATOR_API_KEY;

console.log(`Using API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT FOUND'}`);

const BASE_URL = "https://api.sandbox.viator.com/partner";

// Known destination IDs (same as in lib/viator.ts)
const KNOWN_DESTINATIONS = {
    "barcelona": 562,
    "munich": 549,
    "paris": 479,
    "las vegas": 684,
    "new york": 712,
};

function getHeaders() {
    return {
        "exp-api-key": API_KEY,
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
        "Accept": "application/json;version=2.0",
    };
}

async function searchProducts(destId, city) {
    console.log(`\nSearching products for ${city} (destId: ${destId})...`);

    const body = {
        filtering: {
            destination: destId.toString(),
        },
        pagination: {
            start: 1,
            count: 8
        },
        currency: "USD"
    };

    console.log("Request body:", JSON.stringify(body));

    const res = await fetch(`${BASE_URL}/products/search`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body)
    });

    console.log(`Response status: ${res.status}`);

    if (res.status !== 200) {
        console.log("Error:", await res.text());
        return [];
    }

    const data = await res.json();

    if (!data.success) {
        console.log("API Error:", data.errorMessage || data);
        return [];
    }

    console.log(`Success: ${data.success}, Total count: ${data.totalCount}`);
    console.log(`Found ${data.data?.length || 0} products`);

    if (data.data?.length > 0) {
        console.log("\nProducts:");
        data.data.slice(0, 5).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.title}`);
            console.log(`     Code: ${p.productCode}`);
            console.log(`     Price: $${p.priceFrom || 'N/A'}`);
            console.log(`     Rating: ${p.rating || 'N/A'} (${p.reviewCount || 0} reviews)`);
            console.log(`     Duration: ${p.duration || 'N/A'}`);
            console.log(`     Image: ${p.thumbnailURL ? 'Yes' : 'No'}`);
        });
    }

    return data.data || [];
}

(async () => {
    try {
        // Test with a few cities
        for (const [city, destId] of Object.entries(KNOWN_DESTINATIONS)) {
            const products = await searchProducts(destId, city);
            if (products.length > 0) {
                console.log(`\n✅ SUCCESS: Found ${products.length} products for ${city}!`);
                break; // Stop on first success for testing
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
})();
