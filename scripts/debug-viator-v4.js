
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VIATOR_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.VIATOR_API_KEY;

const BASE_URL = "https://api.sandbox.viator.com/partner";

async function test(label, item) {
    console.log(`\nTesting: ${label}`);

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
                searchTypes: [item]
            })
        });

        const txt = await res.text();
        console.log(`Status: ${res.status}`);
        // Log first 500 chars to catch field names
        console.log("Error:", txt.substring(0, 500));

    } catch (e) {
        console.error(e.message);
    }
}

(async () => {
    // Brute force object fields
    await test("Object { type: 'DESTINATION' }", { type: "DESTINATION" });
    await test("Object { searchType: 'DESTINATION' }", { searchType: "DESTINATION" });
    await test("Object { name: 'DESTINATION' }", { name: "DESTINATION" });
    await test("Object { category: 'DESTINATION' }", { category: "DESTINATION" });
    await test("Object { value: 'DESTINATION' }", { value: "DESTINATION" });
})();
