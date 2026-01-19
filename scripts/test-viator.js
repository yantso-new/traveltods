const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
console.log("Loading env from:", envPath);
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        // Handle comments and simple parsing
        if (line.startsWith('#')) return;
        const firstEquals = line.indexOf('=');
        if (firstEquals === -1) return;

        const key = line.substring(0, firstEquals).trim();
        let value = line.substring(firstEquals + 1).trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key) {
            process.env[key] = value;
        }
    });
} else {
    console.log(".env.local not found");
}

const API_KEY = process.env.VIATOR_API_KEY;

if (!API_KEY) {
    console.error("Error: VIATOR_API_KEY not found in .env.local");
    // Don't exit, maybe it's in system env
} else {
    console.log("VIATOR_API_KEY found (length: " + API_KEY.length + ")");
}

const BASE_URL = "https://api.sandbox.viator.com/partner";

async function testViator() {
    console.log("Testing Viator API connection...");

    // 1. Search for Destination
    const city = "Barcelona";
    console.log(`Searching for destination: ${city}`);

    try {
        const searchResp = await fetch(`${BASE_URL}/search/freetext`, {
            method: "POST",
            headers: {
                "exp-api-key": API_KEY,
                "Accept-Language": "en-US",
                "Currency-Code": "USD",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                searchTerm: city,
                types: ["DESTINATION"],
                topX: "1-3",
                currency: "USD"
            })
        });

        if (!searchResp.ok) {
            console.error("Search Request Failed:", searchResp.status, await searchResp.text());
            return;
        }

        const searchData = await searchResp.json();
        // console.log("Search Response Data:", JSON.stringify(searchData, null, 2));

        const dest = searchData.data?.find(d => d.resultType === "DESTINATION");
        if (!dest) {
            console.error("No destination found for", city);
            console.log("Full data:", JSON.stringify(searchData, null, 2));
            return;
        }

        const destId = dest.data.destinationId;
        console.log(`Found Destination ID: ${destId} for ${dest.data.name}`);

        // 2. Search for Products
        console.log(`Searching products for ID: ${destId}`);
        const productResp = await fetch(`${BASE_URL}/products/search`, {
            method: "POST",
            headers: {
                "exp-api-key": API_KEY,
                "Accept-Language": "en-US",
                "Currency-Code": "USD",
                "Content-Type": "application/json",
                "Accept": "application/json;version=2.0",
            },
            body: JSON.stringify({
                filtering: {
                    destination: destId.toString(),
                },
                sorting: {
                    sort: "TOP_SELLERS",
                    order: "DESCENDING"
                },
                pagination: {
                    start: 1,
                    count: 5
                },
                currency: "USD"
            })
        });

        if (!productResp.ok) {
            console.error("Product Search Failed:", productResp.status, await productResp.text());
            return;
        }

        const productData = await productResp.json();
        console.log(`Found ${productData.products?.length || 0} products.`);
        if (productData.products?.length > 0) {
            console.log("Sample Product:", productData.products[0].title);
        } else {
            console.log("Response:", JSON.stringify(productData, null, 2));
        }

    } catch (e) {
        console.error("Exception during request:", e);
    }
}

testViator();
