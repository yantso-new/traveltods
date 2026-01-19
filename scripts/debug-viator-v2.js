
const fs = require('fs');
const path = require('path');

// robust env loader
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VIATOR_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.VIATOR_API_KEY;

console.log(`Key loaded: ${API_KEY ? API_KEY.substring(0, 5) + '...' : 'NONE'}`);

const BASE_URL = "https://api.sandbox.viator.com/partner";

async function test(label, body) {
    console.log(`\nTesting: ${label}`);
    console.log(`Payload: ${JSON.stringify(body)}`);

    try {
        const res = await fetch(`${BASE_URL}/search/freetext`, {
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
                ...body
            })
        });

        const txt = await res.text();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log("SUCCESS");
        } else {
            console.log("Error:", txt);
        }
    } catch (e) {
        console.error(e);
    }
}

(async () => {
    // 1. Correct field name attempts
    await test("searchTypes: ['DESTINATIONS']", { searchTypes: ["DESTINATIONS"] });
    await test("searchTypes: ['destinations']", { searchTypes: ["destinations"] });
    await test("searchTypes: ['Destinations']", { searchTypes: ["Destinations"] });

    // 2. Enum object attempts (unlikely but possible)
    await test("searchTypes: [{type:'DESTINATIONS'}]", { searchTypes: [{ type: "DESTINATIONS" }] });

    // 3. Fallback to 'types' (maybe I messed up previously?)
    await test("types: ['DESTINATIONS']", { types: ["DESTINATIONS"] });

    // 4. Maybe Singular?
    await test("searchTypes: ['DESTINATION']", { searchTypes: ["DESTINATION"] });

    // 5. Try product search just to see if key works
    await test("searchTypes: ['PRODUCTS']", { searchTypes: ["PRODUCTS"] });

})();
