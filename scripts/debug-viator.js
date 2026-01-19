
const API_KEY = process.env.VIATOR_API_KEY; // Ensure env is loaded or passed
const BASE_URL = "https://api.sandbox.viator.com/partner";

async function testPayload(name, payload) {
    console.log(`\n--- Testing ${name} ---`);
    try {
        const response = await fetch(`${BASE_URL}/search/freetext`, {
            method: "POST",
            headers: {
                "exp-api-key": API_KEY,
                "Accept-Language": "en-US",
                "Currency-Code": "USD",
                "Content-Type": "application/json",
                "Accept": "application/json;version=2.0",
            },
            body: JSON.stringify({
                searchTerm: "Barcelona",
                topX: "1-3",
                currency: "USD",
                ...payload
            })
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            console.log("SUCCESS!");
            // console.log(text.substring(0, 200));
        } else {
            console.log("Error:", text.substring(0, 300));
        }
    } catch (e) {
        console.log("Exception:", e.message);
    }
}

const fs = require('fs');
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (line.startsWith('#')) return;
        const [k, v] = line.split('=');
        if (k && v) process.env[k.trim()] = v.trim();
    });
}
// Fix manual load if needed
if (!process.env.VIATOR_API_KEY) {
    // Hardcode for test if env parsing failed (simple parser above)
    // process.env.VIATOR_API_KEY = "..."
}

(async () => {
    // 1. types: DESTINATION (current)
    await testPayload("types: DESTINATION", { types: ["DESTINATION"] });

    // 2. types: DESTINATIONS (plural)
    await testPayload("types: DESTINATIONS", { types: ["DESTINATIONS"] });

    // 3. searchTypes: DESTINATION
    await testPayload("searchTypes: DESTINATION", { searchTypes: ["DESTINATION"] });

    // 4. searchTypes: DESTINATIONS
    await testPayload("searchTypes: DESTINATIONS", { searchTypes: ["DESTINATIONS"] });

    // 5. types: PRODUCTS
    await testPayload("types: PRODUCTS", { types: ["PRODUCTS"] });

    // 6. Lowercase types
    await testPayload("types: destinations", { types: ["destinations"] });

    // 7. searchTypes: PRODUCTS
    await testPayload("searchTypes: PRODUCTS", { searchTypes: ["PRODUCTS"] });

})();
