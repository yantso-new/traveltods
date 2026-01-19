
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VIATOR_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.VIATOR_API_KEY;

console.log(`Using API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT FOUND'}`);

const BASE_URL = "https://api.sandbox.viator.com/partner";

async function getDestinationId(city) {
    console.log(`\n1. Searching for destination: ${city}`);

    const body = {
        searchTerm: city,
        searchTypes: [{ searchType: "DESTINATIONS" }],
        pagination: { offset: 0, limit: 3 },
        currency: "USD"
    };

    console.log("Request body:", JSON.stringify(body, null, 2));

    const res = await fetch(`${BASE_URL}/search/freetext`, {
        method: "POST",
        headers: {
            "exp-api-key": API_KEY,
            "Accept-Language": "en-US",
            "Currency-Code": "USD",
            "Content-Type": "application/json",
            "Accept": "application/json;version=2.0",
        },
        body: JSON.stringify(body)
    });

    const txt = await res.text();
    console.log(`Response status: ${res.status}`);

    if (res.status !== 200) {
        console.log("Error:", txt);
        return null;
    }

    const data = JSON.parse(txt);
    console.log("Response data:", JSON.stringify(data, null, 2));

    // Extract destination ID
    const destinations = data.data;
    if (destinations && destinations.length > 0) {
        const dest = destinations.find(d => d.resultType === "DESTINATION");
        if (dest) {
            console.log(`Found destination: ${dest.data.name} (ID: ${dest.data.destinationId})`);
            return dest.data.destinationId;
        }
    }

    console.log("No destination found in response");
    return null;
}

async function getProducts(destinationId) {
    console.log(`\n2. Searching products for destination ID: ${destinationId}`);

    const body = {
        filtering: {
            destination: destinationId.toString(),
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
    };

    console.log("Request body:", JSON.stringify(body, null, 2));

    const res = await fetch(`${BASE_URL}/products/search`, {
        method: "POST",
        headers: {
            "exp-api-key": API_KEY,
            "Accept-Language": "en-US",
            "Currency-Code": "USD",
            "Content-Type": "application/json",
            "Accept": "application/json;version=2.0",
        },
        body: JSON.stringify(body)
    });

    const txt = await res.text();
    console.log(`Response status: ${res.status}`);

    if (res.status !== 200) {
        console.log("Error:", txt);
        return [];
    }

    const data = JSON.parse(txt);
    console.log(`Found ${data.products?.length || 0} products`);

    if (data.products && data.products.length > 0) {
        console.log("\nSample products:");
        data.products.slice(0, 3).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.title} - $${p.pricing?.summary?.fromPrice || 'N/A'}`);
        });
    }

    return data.products || [];
}

(async () => {
    try {
        const destId = await getDestinationId("Barcelona");

        if (destId) {
            await getProducts(destId);
        } else {
            console.log("\nCould not proceed to product search without destination ID");
        }
    } catch (e) {
        console.error("Exception:", e);
    }
})();
