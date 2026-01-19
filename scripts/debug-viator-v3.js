
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VIATOR_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.VIATOR_API_KEY;

const BASE_URL = "https://api.sandbox.viator.com/partner";

async function test(label, body, headers = {}) {
    console.log(`\nTesting: ${label}`);

    // Default Headers
    const reqHeaders = {
        "exp-api-key": API_KEY,
        "Accept-Language": "en-US",
        "Currency-Code": "USD",
        "Content-Type": "application/json",
        "Accept": "application/json;version=2.0",
        ...headers
    };

    try {
        const res = await fetch(`${BASE_URL}/search/freetext`, {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify({
                searchTerm: "Barcelona",
                topX: "1-3",
                currency: "USD",
                ...body
            })
        });

        const txt = await res.text();
        console.log(`Status: ${res.status}`);
        if (res.status !== 200) console.log("Error:", txt.substring(0, 300));
        else console.log("SUCCESS!");

    } catch (e) {
        console.error(e.message);
    }
}

(async () => {
    // 1. OBJECT Enum ?
    await test("searchTypes: [{searchType: 'DESTINATION'}]", { searchTypes: [{ searchType: "DESTINATION" }] });
    await test("searchTypes: [{type: 'DESTINATION'}]", { searchTypes: [{ type: "DESTINATION" }] });

    // 2. No Version Header?
    await test("No Version Header + types: ['DESTINATION']", { types: ["DESTINATION"] }, { "Accept": "application/json" });

    // 3. Version 1.0 Header?
    await test("Version 1.0 + types: ['DESTINATION']", { types: ["DESTINATION"] }, { "Accept": "application/json;version=1.0" });

    // 4. searchTypes lowercase 'destination'
    await test("searchTypes: ['destination']", { searchTypes: ["destination"] });
})();
